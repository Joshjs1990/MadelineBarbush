import { requireApiUser } from "@/lib/auth/session";
import { toYouTubeEmbedUrl } from "@/lib/media/youtube";
import type { Showreel } from "@/lib/site-settings/showreel";
import { getShowreel, saveShowreel } from "@/lib/site-settings/store";

export const runtime = "edge";

export async function GET(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  return Response.json({ data: await getShowreel() });
}

export async function PUT(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  const input = (await request.json()) as Partial<Showreel>;
  const videoUrl = input.videoUrl?.trim() ?? "";

  // Reject a URL the homepage cannot embed, rather than saving something that
  // silently falls back to the placeholder.
  if (videoUrl && !toYouTubeEmbedUrl(videoUrl)) {
    return Response.json(
      { error: "That is not a YouTube link the player can embed." },
      { status: 400 },
    );
  }

  try {
    return Response.json({ data: await saveShowreel(input) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the showreel.";
    return Response.json({ error: message }, { status: 503 });
  }
}
