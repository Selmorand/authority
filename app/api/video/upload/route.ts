import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// POST /api/video/upload
// Multipart form-data upload of a background image. Saves to
// public/uploads/ and returns the publicly accessible URL.
//
// Caveats:
// - When running locally, the returned URL is on localhost and is
//   NOT reachable from JSON2Video's servers. Use ngrok or deploy to
//   actually use uploaded images in a render.
// - On Railway, public/uploads is writable but ephemeral across
//   deploys. For permanent backgrounds, commit them to
//   public/backgrounds/ in the repo instead.

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { success: false, error: "No file uploaded under 'file' field" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type}. Use JPEG, PNG, or WebP.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return Response.json(
        { success: false, error: "File too large. Max 10 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext =
      file.type === "image/png" ? "png" :
      file.type === "image/webp" ? "webp" :
      "jpg";
    const filename = `bg-${randomUUID()}.${ext}`;
    const fullPath = path.join(uploadDir, filename);
    await writeFile(fullPath, buffer);

    const url = `/uploads/${filename}`;
    return Response.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
