import { requireApiUser } from "@/lib/auth/session";
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

  if (videoUrl && !/^https:\/\//i.test(videoUrl)) {
    return Response.json(
      { error: "Use a secure YouTube or direct R2 media URL." },
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
