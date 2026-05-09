"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function ManualViewer() {
  const [content, setContent] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/manual")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setContent(d.content);
      })
      .catch(() => {});
  }, []);

  // Simple search highlight — filter to sections containing the query
  const sections = content.split(/(?=^## )/m);
  const filtered = search.trim()
    ? sections.filter((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      )
    : sections;

  return (
    <section className="lg:col-span-2 rounded-xl border border-card-border bg-card-bg/80 p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground-bright tracking-wide uppercase">
            Operational Manual
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Reference guide &middot; Strategy concepts &middot; Best practices
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search manual..."
          className="w-full sm:w-64 px-3 py-2 rounded-lg bg-background-raised border border-card-border-subtle text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30"
        />
      </div>

      {content ? (
        <article className="manual-content max-h-[75vh] overflow-y-auto pr-2">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-foreground-bright mt-8 mb-4 pb-2 border-b border-card-border-subtle first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-foreground-bright mt-8 mb-3 pb-1.5 border-b border-card-border-subtle/50">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold text-foreground-bright mt-5 mb-2">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-xs font-semibold text-accent mt-4 mb-1.5 uppercase tracking-wider">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="space-y-1.5 mb-3 ml-1 list-decimal list-inside">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent/50 shrink-0 mt-2" />
                  <span>{children}</span>
                </li>
              ),
              strong: ({ children }) => (
                <strong className="text-foreground-bright font-semibold">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="text-accent/80 not-italic">{children}</em>
              ),
              code: ({ children, className }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return (
                    <code className="block bg-background rounded-lg border border-card-border-subtle px-4 py-3 text-xs text-foreground/80 font-mono overflow-x-auto mb-3">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="bg-background-raised border border-card-border-subtle rounded px-1.5 py-0.5 text-xs text-accent font-mono">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="mb-3">{children}</pre>
              ),
              hr: () => (
                <hr className="border-card-border-subtle my-6" />
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-accent/30 pl-4 my-3 text-sm text-muted italic">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-3">
                  <table className="w-full text-sm">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="border-b border-card-border-subtle">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="text-left text-xs font-semibold text-foreground-bright px-3 py-2">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="text-xs text-foreground/80 px-3 py-2 border-b border-card-border-subtle/30">
                  {children}
                </td>
              ),
            }}
          >
            {filtered.join("")}
          </ReactMarkdown>
        </article>
      ) : (
        <div className="rounded-lg bg-background-raised border border-card-border-subtle px-6 py-10 text-center">
          <p className="text-sm text-muted">Loading manual...</p>
        </div>
      )}
    </section>
  );
}
