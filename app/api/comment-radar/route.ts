import prisma from "@/lib/prisma";
import { discoverRedditPosts } from "@/lib/redditDiscovery";
import { discoverYouTubePosts } from "@/lib/youtubeDiscovery";
import { draftComment } from "@/lib/commentDrafter";

// ─── GET /api/comment-radar?status=pending|posted|ignored ────
// Returns CommentTarget rows. Defaults to status=pending.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pending";
  try {
    const targets = await prisma.commentTarget.findMany({
      where: status === "all" ? {} : { status },
      orderBy: { discoveredAt: "desc" },
      take: 200,
    });
    return Response.json({ success: true, targets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "DB read failed";
    return Response.json(
      { success: false, targets: [], error: message },
      { status: 500 }
    );
  }
}

// ─── POST /api/comment-radar ─────────────────────────────────
// Body: { action: "discover" | "manual" | "update" | "regenerate" | "delete", ... }
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: string;
      // discover
      pillars?: string[];
      // manual
      platform?: string;
      url?: string;
      postSnippet?: string;
      postTitle?: string;
      // update
      id?: string;
      status?: string;
      draftComment?: string;
    };

    if (body.action === "discover") {
      const [reddit, youtube] = await Promise.all([
        discoverRedditPosts(body.pillars).catch((err) => ({
          available: false,
          candidates: [],
          error: err instanceof Error ? err.message : "Reddit discovery failed",
        })),
        discoverYouTubePosts(body.pillars).catch((err) => ({
          available: false,
          candidates: [],
          error: err instanceof Error ? err.message : "YouTube discovery failed",
        })),
      ]);

      // Interleave so both platforms are represented even when capped.
      const interleaved: Array<{ platform: string; url: string; postTitle: string; postSnippet: string; postAuthor: string; postMetric: string; pillar: string; topicKeyword: string }> = [];
      const rIter = reddit.candidates.map((c) => ({ ...c, platform: "reddit" }));
      const yIter = youtube.candidates.map((c) => ({ ...c, platform: "youtube" }));
      const max = Math.max(rIter.length, yIter.length);
      for (let i = 0; i < max; i++) {
        if (i < rIter.length) interleaved.push(rIter[i]);
        if (i < yIter.length) interleaved.push(yIter[i]);
      }

      // Filter out URLs already in the DB before spending Claude calls.
      const existingUrls = new Set(
        (
          await prisma.commentTarget.findMany({
            where: { url: { in: interleaved.map((c) => c.url) } },
            select: { url: true },
          })
        ).map((r) => r.url)
      );
      const fresh = interleaved.filter((c) => !existingUrls.has(c.url)).slice(0, 20);
      const dupSkipped = interleaved.length - fresh.length;

      // Draft comments in parallel batches of 5 to stay under timeout.
      let saved = 0;
      let offTopic = 0;
      const BATCH = 5;
      for (let i = 0; i < fresh.length; i += BATCH) {
        const slice = fresh.slice(i, i + BATCH);
        const drafts = await Promise.all(
          slice.map((c) =>
            draftComment({
              platform: c.platform,
              url: c.url,
              postTitle: c.postTitle,
              postSnippet: c.postSnippet,
              postAuthor: c.postAuthor,
              pillar: c.pillar,
            }).catch(() => null)
          )
        );
        for (let j = 0; j < slice.length; j++) {
          const c = slice[j];
          const drafted = drafts[j];
          if (!drafted || !drafted.draftComment) {
            offTopic++;
            continue;
          }
          await prisma.commentTarget.create({
            data: {
              platform: c.platform,
              source: "discovery",
              url: c.url,
              postTitle: c.postTitle,
              postSnippet: c.postSnippet,
              postAuthor: c.postAuthor,
              postMetric: c.postMetric,
              pillar: drafted.pillar || c.pillar,
              topicKeyword: c.topicKeyword,
              draftComment: drafted.draftComment,
              status: "pending",
            },
          });
          saved++;
        }
      }
      const skipped = dupSkipped + offTopic;

      return Response.json({
        success: true,
        saved,
        skipped,
        reddit: { available: reddit.available, error: reddit.error },
        youtube: { available: youtube.available, error: youtube.error },
      });
    }

    if (body.action === "manual") {
      if (!body.platform || !body.url) {
        return Response.json(
          { success: false, error: "platform and url are required for manual entry" },
          { status: 400 }
        );
      }
      const platform = body.platform.toLowerCase();
      const drafted = await draftComment({
        platform,
        url: body.url,
        postTitle: body.postTitle,
        postSnippet: body.postSnippet,
      });
      if (!drafted.success || !drafted.draftComment) {
        return Response.json(
          { success: false, error: drafted.error ?? "Comment draft was empty (likely off-topic)" },
          { status: 400 }
        );
      }
      const target = await prisma.commentTarget.create({
        data: {
          platform,
          source: "manual",
          url: body.url,
          postTitle: body.postTitle,
          postSnippet: body.postSnippet,
          pillar: drafted.pillar,
          draftComment: drafted.draftComment,
          status: "pending",
        },
      });
      return Response.json({ success: true, target });
    }

    if (body.action === "regenerate") {
      if (!body.id) {
        return Response.json({ success: false, error: "id required" }, { status: 400 });
      }
      const target = await prisma.commentTarget.findUnique({ where: { id: body.id } });
      if (!target) {
        return Response.json({ success: false, error: "Not found" }, { status: 404 });
      }
      const drafted = await draftComment({
        platform: target.platform,
        url: target.url,
        postTitle: target.postTitle ?? undefined,
        postSnippet: target.postSnippet ?? undefined,
        postAuthor: target.postAuthor ?? undefined,
        pillar: target.pillar ?? undefined,
      });
      if (!drafted.success || !drafted.draftComment) {
        return Response.json(
          { success: false, error: drafted.error ?? "Regenerate produced empty comment" },
          { status: 500 }
        );
      }
      const updated = await prisma.commentTarget.update({
        where: { id: body.id },
        data: { draftComment: drafted.draftComment, pillar: drafted.pillar ?? target.pillar },
      });
      return Response.json({ success: true, target: updated });
    }

    if (body.action === "update") {
      if (!body.id) {
        return Response.json({ success: false, error: "id required" }, { status: 400 });
      }
      const data: Record<string, unknown> = {};
      if (body.status === "posted") {
        data.status = "posted";
        data.postedAt = new Date();
      } else if (body.status === "ignored" || body.status === "pending") {
        data.status = body.status;
        if (body.status === "pending") data.postedAt = null;
      }
      if (typeof body.draftComment === "string") data.draftComment = body.draftComment;
      const updated = await prisma.commentTarget.update({
        where: { id: body.id },
        data,
      });
      return Response.json({ success: true, target: updated });
    }

    if (body.action === "delete") {
      if (!body.id) {
        return Response.json({ success: false, error: "id required" }, { status: 400 });
      }
      await prisma.commentTarget.delete({ where: { id: body.id } });
      return Response.json({ success: true });
    }

    return Response.json(
      { success: false, error: `Unknown action "${body.action ?? "(none)"}"` },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export const maxDuration = 300;
