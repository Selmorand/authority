import {
  getMovieStatus,
  submitMovie,
  type J2VMovieSpec,
} from "@/lib/json2video";
import { renderTemplate } from "@/lib/videoTemplates";

// ─── POST /api/video/render ─────────────────────────────────
// Two modes:
//   1. Caption-clip mode (recommended for repurposing):
//      Body: { mode: "caption-clip", lines: string[], headline?: string,
//              backgroundColor?: string, orientation?: "portrait"|"landscape"|"square",
//              secondsPerLine?: number }
//   2. Raw mode (advanced):
//      Body: { mode: "raw", spec: J2VMovieSpec }
//
// Returns { success, project } when accepted. Poll via GET below.

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mode?: "caption-clip" | "raw";
      templateId?: string;
      lines?: string[];
      headline?: string;
      backgroundColor?: string;
      backgroundImageUrl?: string;
      orientation?: "portrait" | "landscape" | "square";
      secondsPerLine?: number;
      spec?: J2VMovieSpec;
    };

    const mode = body.mode ?? "caption-clip";

    let spec: J2VMovieSpec;
    if (mode === "raw") {
      if (!body.spec || !Array.isArray(body.spec.scenes)) {
        return Response.json(
          { success: false, error: "raw mode requires a spec with scenes" },
          { status: 400 }
        );
      }
      spec = body.spec;
    } else {
      if (!Array.isArray(body.lines) || body.lines.length === 0) {
        return Response.json(
          { success: false, error: "caption-clip mode requires a non-empty lines array" },
          { status: 400 }
        );
      }
      // Trim to avoid burning credits on accidental novels.
      const lines = body.lines
        .filter((l) => typeof l === "string" && l.trim().length > 0)
        .slice(0, 12);

      // Resolve relative upload paths to absolute URLs so JSON2Video can fetch them.
      let backgroundImageUrl = body.backgroundImageUrl?.trim() || undefined;
      if (backgroundImageUrl && backgroundImageUrl.startsWith("/")) {
        const origin = new URL(request.url).origin;
        backgroundImageUrl = `${origin}${backgroundImageUrl}`;
      }

      // Catch the most common deploy/local mistake before we waste a render call.
      if (backgroundImageUrl) {
        const lower = backgroundImageUrl.toLowerCase();
        const isLocal =
          lower.includes("localhost") ||
          lower.includes("127.0.0.1") ||
          lower.startsWith("http://0.0.0.0") ||
          /:\/\/192\.168\./.test(lower) ||
          /:\/\/10\./.test(lower);
        if (isLocal) {
          return Response.json(
            {
              success: false,
              error:
                "Background image URL points to a local address (" +
                backgroundImageUrl +
                ") which JSON2Video cannot reach. Paste a public image URL (e.g. imgur.com), or deploy to Railway and use the Railway domain.",
            },
            { status: 400 }
          );
        }
      }

      const templateId = body.templateId?.trim() || "caption-stack";

      try {
        spec = await renderTemplate(templateId, {
          lines,
          headline: body.headline,
          backgroundColor: body.backgroundColor,
          backgroundImageUrl,
          baseDurationSeconds: body.secondsPerLine,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Template load failed";
        return Response.json(
          {
            success: false,
            error: `Template "${templateId}" failed to load: ${message}`,
          },
          { status: 500 }
        );
      }
    }

    const result = await submitMovie(spec);
    if (!result.success) {
      return Response.json(
        { success: false, error: result.error ?? "Unknown JSON2Video error" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      project: result.project,
      timestamp: result.timestamp,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

// ─── GET /api/video/render?project=... ──────────────────────
// Poll status of a previously submitted render.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const project = url.searchParams.get("project");
  if (!project) {
    return Response.json(
      { success: false, error: "project query parameter is required" },
      { status: 400 }
    );
  }

  const status = await getMovieStatus(project);
  return Response.json(status);
}

export const dynamic = "force-dynamic";
