import { requireApiUser } from "@/lib/auth/session";
import { getVisualMedia, saveVisualMedia, type VisualMedia } from "@/lib/site-settings/media";

export const runtime = "edge";

export async function GET(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  return Response.json({ data: await getVisualMedia() }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const input = await request.json().catch(() => ({})) as { media?: Partial<VisualMedia> };
  if (!input.media || typeof input.media !== "object") return Response.json({ error: "Choose an image before saving." }, { status: 400 });
  try {
    return Response.json({ data: await saveVisualMedia(input.media) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Image settings could not be saved." }, { status: 400 });
  }
}
