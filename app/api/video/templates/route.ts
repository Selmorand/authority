import { listTemplates } from "@/lib/videoTemplates";

// GET /api/video/templates
// Returns the list of available video templates so the UI can populate
// its template dropdown.
export async function GET() {
  try {
    const templates = await listTemplates();
    return Response.json({ success: true, templates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, error: message, templates: [] },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
