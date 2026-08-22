import { requireApiUser } from "@/lib/auth/session";
import { getMediaOrder, saveMediaOrder } from "@/lib/site-settings/media";

export const runtime = "edge";

export async function POST(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const input = await request.json() as { keys?: unknown };
  if (!Array.isArray(input.keys) || input.keys.some((key) => typeof key !== "string")) {
    return Response.json({ error: "Invalid media order." }, { status: 400 });
  }
  const current = await getMediaOrder();
  const keys = [...new Set(input.keys as string[])];
  const remaining = current.filter((key) => !keys.includes(key));
  await saveMediaOrder([...keys, ...remaining]);
  return Response.json({ data: keys });
}
