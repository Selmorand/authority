import { amplifyAssetAI, amplifyAssetLocal } from "@/lib/authorityAmplifier";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useAI = body.useAI !== false;

    const source = {
      title: body.title ?? "",
      content: body.content ?? "",
      type: body.type ?? "article",
      theme: body.theme ?? "ai-readiness",
      keyInsights: body.keyInsights ?? [],
    };

    if (!source.title || !source.content) {
      return Response.json(
        { success: false, error: "title and content are required" },
        { status: 400 }
      );
    }

    const result = useAI
      ? await amplifyAssetAI(source)
      : amplifyAssetLocal(source);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
