import { requireApiUser } from "@/lib/auth/session";
import { toYouTubeEmbedUrl } from "@/lib/media/youtube";
import { getExternalMedia, saveExternalMedia } from "@/lib/site-settings/media";

export const runtime = "edge";

export async function POST(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const input = await request.json() as { title?: string; url?: string };
  const title = input.title?.trim() || "YouTube video";
  const url = input.url?.trim() || "";
  if (!/^https:\/\//i.test(url) || !toYouTubeEmbedUrl(url)) return Response.json({ error: "Enter a valid secure YouTube link." }, { status: 400 });
  const items = await getExternalMedia();
  const item = { id: crypto.randomUUID(), title, url, contentType: "youtube" as const, placements: [] };
  await saveExternalMedia([...items, item]);
  return Response.json({ data: item });
}
