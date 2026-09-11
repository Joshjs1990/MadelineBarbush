import { requireApiUser } from "@/lib/auth/session";
import { getVisualMedia, saveVisualMedia, type VisualMedia } from "@/lib/site-settings/media";
import { getGlobalTypography, getTextSizing, saveGlobalTypography, saveTextSizing, type GlobalTypography, type TextSizing } from "@/lib/site-settings/typography";

export const runtime = "edge";

export async function GET(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const [data, textSizing, globalTypography] = await Promise.all([getVisualMedia(), getTextSizing(), getGlobalTypography()]);
  return Response.json({ data, textSizing, globalTypography }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const input = await request.json().catch(() => ({})) as { media?: Partial<VisualMedia>; textSizing?: TextSizing; globalTypography?: GlobalTypography };
  const hasMedia = Boolean(input.media && typeof input.media === "object");
  const hasTextSizing = input.textSizing !== undefined && typeof input.textSizing === "object" && input.textSizing !== null;
  const hasGlobalTypography = input.globalTypography !== undefined && typeof input.globalTypography === "object" && input.globalTypography !== null;
  if (!hasMedia && !hasTextSizing && !hasGlobalTypography) return Response.json({ error: "Choose an image or typography setting before saving." }, { status: 400 });
  try {
    const [data, textSizing, globalTypography] = await Promise.all([
      hasMedia ? saveVisualMedia(input.media as Partial<VisualMedia>) : getVisualMedia(),
      hasTextSizing ? saveTextSizing(input.textSizing) : getTextSizing(),
      hasGlobalTypography ? saveGlobalTypography(input.globalTypography) : getGlobalTypography(),
    ]);
    return Response.json({ data, textSizing, globalTypography }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Visual settings could not be saved." }, { status: 400 });
  }
}
