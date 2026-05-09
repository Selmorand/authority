import { createBackup } from "@/lib/systemHealth";

export async function POST() {
  const result = await createBackup();
  return Response.json(result);
}
