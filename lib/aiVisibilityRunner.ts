// ─── AI-Visibility Runner ────────────────────────────────────
// Asks ChatGPT (OpenAI Responses API + web_search) and Claude
// (Anthropic Messages + web_search_20250305) the target queries
// from data/aiVisibilityQueries.ts, then detects whether Interon
// (interon.co.za / "Interon" / "George Whiteside") was cited.

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import prisma from "./prisma";
import { aiVisibilityQueries } from "@/data/aiVisibilityQueries";
import type { AIVisibilityQuery } from "@/data/aiVisibilityQueries";

export type Engine = "openai" | "anthropic";

export interface CheckResult {
  queryId: string;
  query: string;
  engine: Engine;
  cited: boolean;
  position: number | null;
  matchedBy: "url" | "text" | "both" | null;
  citations: string[];
  responseExcerpt: string;
  error?: string;
}

// ─── Prompt ──────────────────────────────────────────────────

function promptFor(query: string): string {
  return `Search the web and provide a substantive answer to the question below. After your answer, list the 5–8 most authoritative sources you used or would recommend, one URL per line under a "Sources:" heading.

QUESTION: ${query}`;
}

// ─── Engine clients ──────────────────────────────────────────

async function checkOpenAI(q: AIVisibilityQuery): Promise<CheckResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return errorResult(q, "openai", "OPENAI_API_KEY not configured");
  }
  const client = new OpenAI({ apiKey });

  try {
    // OpenAI Responses API with the built-in web_search tool.
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: promptFor(q.query),
      tools: [{ type: "web_search_preview" }],
    });

    // SDK exposes output_text on the response object.
    const text =
      (response as unknown as { output_text?: string }).output_text ??
      extractTextFromOutput((response as unknown as { output?: unknown }).output);

    const urls = extractUrlsFromOutput(
      (response as unknown as { output?: unknown }).output,
      text
    );
    return detect(q, "openai", text, urls);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResult(q, "openai", msg);
  }
}

async function checkAnthropic(q: AIVisibilityQuery): Promise<CheckResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return errorResult(q, "anthropic", "ANTHROPIC_API_KEY not configured");
  }
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3,
        },
      ],
      messages: [{ role: "user", content: promptFor(q.query) }],
    });

    const blocks = ((response.content ?? []) as unknown) as Array<Record<string, unknown>>;

    // Concatenate text blocks
    const text = blocks
      .filter((b) => b.type === "text")
      .map((b) => (typeof b.text === "string" ? b.text : ""))
      .join("\n")
      .trim();

    // Pull URLs from web_search_tool_result blocks (Claude's structured citations)
    const structuredUrls: string[] = [];
    for (const b of blocks) {
      if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
        for (const r of b.content as Array<Record<string, unknown>>) {
          if (typeof r.url === "string") structuredUrls.push(r.url);
        }
      }
    }

    // Combine structured citations with any URLs the model wrote into the text
    const allUrls = Array.from(new Set([...structuredUrls, ...extractUrlsFromText(text)]));
    return detect(q, "anthropic", text, allUrls);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return errorResult(q, "anthropic", msg);
  }
}

// ─── Citation detection ──────────────────────────────────────

function detect(
  q: AIVisibilityQuery,
  engine: Engine,
  text: string,
  urls: string[]
): CheckResult {
  const urlIdx = urls.findIndex((u) => /interon\.co\.za/i.test(u));
  const lower = text.toLowerCase();
  const textMatch =
    /\binteron\b/.test(lower) || /\bgeorge whiteside\b/.test(lower);

  let matchedBy: "url" | "text" | "both" | null = null;
  if (urlIdx >= 0 && textMatch) matchedBy = "both";
  else if (urlIdx >= 0) matchedBy = "url";
  else if (textMatch) matchedBy = "text";

  return {
    queryId: q.id,
    query: q.query,
    engine,
    cited: matchedBy !== null,
    position: urlIdx >= 0 ? urlIdx + 1 : null,
    matchedBy,
    citations: urls.slice(0, 12),
    responseExcerpt: text.slice(0, 500),
  };
}

function errorResult(q: AIVisibilityQuery, engine: Engine, error: string): CheckResult {
  return {
    queryId: q.id,
    query: q.query,
    engine,
    cited: false,
    position: null,
    matchedBy: null,
    citations: [],
    responseExcerpt: "",
    error,
  };
}

// ─── Response parsing helpers ────────────────────────────────

function extractTextFromOutput(output: unknown): string {
  if (!Array.isArray(output)) return "";
  const parts: string[] = [];
  for (const item of output as Array<Record<string, unknown>>) {
    if (item.type === "message" && Array.isArray(item.content)) {
      for (const c of item.content as Array<Record<string, unknown>>) {
        if (
          (c.type === "output_text" || c.type === "text") &&
          typeof c.text === "string"
        ) {
          parts.push(c.text);
        }
      }
    }
  }
  return parts.join("\n").trim();
}

function extractUrlsFromOutput(output: unknown, text: string): string[] {
  const urls: string[] = [];
  if (Array.isArray(output)) {
    for (const item of output as Array<Record<string, unknown>>) {
      if (Array.isArray(item.content)) {
        for (const c of item.content as Array<Record<string, unknown>>) {
          if (Array.isArray(c.annotations)) {
            for (const a of c.annotations as Array<Record<string, unknown>>) {
              if (typeof a.url === "string") urls.push(a.url);
            }
          }
        }
      }
    }
  }
  // Fallback: scrape URLs from the plain text
  urls.push(...extractUrlsFromText(text));
  return Array.from(new Set(urls));
}

function extractUrlsFromText(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)>"'\]]+/g) ?? [];
  return matches.map((u) => u.replace(/[.,;:!?)]+$/, ""));
}

// ─── Orchestrator ────────────────────────────────────────────

export interface RunOptions {
  engines: Engine[];
  priority?: "high" | "all";
  queryIds?: string[];
  concurrency?: number;
}

export interface RunSummary {
  runId: string;
  date: string;
  totalChecks: number;
  citedCount: number;
  perEngine: Record<Engine, { cited: number; total: number }>;
  startedAt: string;
  completedAt: string;
}

export async function runVisibilityCheck(opts: RunOptions): Promise<RunSummary> {
  const runId = randomUUID();
  const date = new Date().toISOString().split("T")[0];
  const startedAt = new Date().toISOString();
  const concurrency = Math.max(1, Math.min(opts.concurrency ?? 5, 10));

  // Filter queries
  let queries = aiVisibilityQueries;
  if (opts.queryIds && opts.queryIds.length > 0) {
    const allow = new Set(opts.queryIds);
    queries = queries.filter((q) => allow.has(q.id));
  } else if (opts.priority === "high") {
    queries = queries.filter((q) => q.priority === "high");
  }

  // Build task list: (query, engine) pairs
  const tasks: Array<{ query: AIVisibilityQuery; engine: Engine }> = [];
  for (const q of queries) {
    for (const e of opts.engines) tasks.push({ query: q, engine: e });
  }

  // Run with bounded concurrency
  const results: CheckResult[] = [];
  let index = 0;
  async function worker() {
    while (true) {
      const i = index++;
      if (i >= tasks.length) return;
      const { query, engine } = tasks[i];
      const r =
        engine === "openai" ? await checkOpenAI(query) : await checkAnthropic(query);
      results.push(r);
      // Persist as we go so partial runs are recoverable.
      await persistResult(runId, date, query, r);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())
  );

  const perEngine: Record<Engine, { cited: number; total: number }> = {
    openai: { cited: 0, total: 0 },
    anthropic: { cited: 0, total: 0 },
  };
  for (const r of results) {
    perEngine[r.engine].total += 1;
    if (r.cited) perEngine[r.engine].cited += 1;
  }

  return {
    runId,
    date,
    totalChecks: results.length,
    citedCount: results.filter((r) => r.cited).length,
    perEngine,
    startedAt,
    completedAt: new Date().toISOString(),
  };
}

async function persistResult(
  runId: string,
  date: string,
  query: AIVisibilityQuery,
  r: CheckResult
): Promise<void> {
  try {
    await prisma.aIVisibilityCheck.create({
      data: {
        runId,
        queryId: query.id,
        platform: r.engine,
        query: query.query,
        cited: r.cited,
        position: r.position ?? null,
        matchedBy: r.matchedBy ?? null,
        citationsJson:
          r.citations.length > 0 ? JSON.stringify(r.citations) : null,
        responseExcerpt: r.responseExcerpt || null,
        date,
        theme: query.theme ?? null,
      },
    });
  } catch {
    // Persistence failure shouldn't halt the run — the in-memory result still returns.
  }
}
