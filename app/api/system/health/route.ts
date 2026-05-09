import { checkSystemHealth } from "@/lib/systemHealth";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await checkSystemHealth();
  return Response.json({ success: true, ...health });
}
