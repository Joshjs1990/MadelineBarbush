import { requireApiUser } from "@/lib/auth/session";
import { getVisualMedia, saveVisualMedia, type VisualMedia } from "@/lib/site-settings/media";
import { getTextSizing, saveTextSizing, type TextSizing } from "@/lib/site-settings/typography";

export const runtime = "edge";

export async function GET(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const [data, textSizing] = await Promise.all([getVisualMedia(), getTextSizing()]);
  return Response.json({ data, textSizing }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const input = await request.json().catch(() => ({})) as { media?: Partial<VisualMedia>; textSizing?: TextSizing };
  const hasMedia = Boolean(input.media && typeof input.media === "object");
  const hasTextSizing = input.textSizing !== undefined && typeof input.textSizing === "object" && input.textSizing !== null;
  if (!hasMedia && !hasTextSizing) return Response.json({ error: "Choose an image or text size before saving." }, { status: 400 });
  try {
    const [data, textSizing] = await Promise.all([
      hasMedia ? saveVisualMedia(input.media as Partial<VisualMedia>) : getVisualMedia(),
      hasTextSizing ? saveTextSizing(input.textSizing) : getTextSizing(),
    ]);
    return Response.json({ data, textSizing }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Visual settings could not be saved." }, { status: 400 });
  }
}
