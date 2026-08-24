import { requireApiUser } from "@/lib/auth/session";
import { getMediaMetadata, saveMediaMetadata } from "@/lib/site-settings/media";

export const runtime = "edge";

export async function POST(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const input = await request.json().catch(() => ({})) as { key?: string; title?: string };
  const key = input.key?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  if (!key) return Response.json({ error: "A media key is required." }, { status: 400 });
  const metadata = await getMediaMetadata();
  if (title) metadata[key] = title;
  else delete metadata[key];
  await saveMediaMetadata(metadata);
  return Response.json({ data: { key, title } });
}
