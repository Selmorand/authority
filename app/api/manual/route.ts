import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const manualPath = path.join(process.cwd(), "MANUAL.md");
    const content = await fs.readFile(manualPath, "utf-8");
    return Response.json({ success: true, content });
  } catch {
    return Response.json(
      { success: false, content: "Manual not found.", error: "File not found" },
      { status: 404 }
    );
  }
}
