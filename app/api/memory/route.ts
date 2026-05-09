import { promises as fs } from "fs";
import path from "path";
import { seedMemory } from "@/data/strategicMemory";
import type { MemoryItem } from "@/data/strategicMemory";

const MEMORY_FILE = path.join(process.cwd(), "data", "memory.json");

async function readMemory(): Promise<MemoryItem[]> {
  try {
    const data = await fs.readFile(MEMORY_FILE, "utf-8");
    return JSON.parse(data) as MemoryItem[];
  } catch {
    // File doesn't exist yet — return seed data
    return seedMemory;
  }
}

async function writeMemory(items: MemoryItem[]): Promise<void> {
  await fs.writeFile(MEMORY_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function GET() {
  const memory = await readMemory();
  return Response.json({ success: true, memory });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = body.item as MemoryItem;
    if (!newItem || !newItem.id || !newItem.theme || !newItem.insight) {
      return Response.json(
        { success: false, error: "Invalid memory item" },
        { status: 400 }
      );
    }

    const memory = await readMemory();
    memory.push(newItem);
    await writeMemory(memory);

    return Response.json({ success: true, total: memory.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
