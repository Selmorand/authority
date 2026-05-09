import { getMemories, createMemory } from "@/lib/db";
import { seedMemory } from "@/data/strategicMemory";
import { validate, MemoryItemSchema } from "@/lib/validation";

export async function GET() {
  try {
    const memory = await getMemories();
    if (memory.length === 0) {
      return Response.json({ success: true, memory: seedMemory, source: "seed" });
    }
    return Response.json({ success: true, memory, source: "database" });
  } catch {
    return Response.json({ success: true, memory: seedMemory, source: "seed" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const v = validate(MemoryItemSchema, body.item ?? body);
    if (!v.success) {
      return Response.json({ success: false, error: v.error }, { status: 400 });
    }

    const created = await createMemory(v.data);
    return Response.json({ success: true, id: created.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
