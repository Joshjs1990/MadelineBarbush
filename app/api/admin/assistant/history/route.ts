import { requireApiUser } from "@/lib/auth/session";
import { getRevisionHistory } from "@/lib/assistant/store";

export const runtime = "edge";

export async function GET(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const limit = Number(new URL(request.url).searchParams.get("limit") ?? "20");
  return Response.json({ data: await getRevisionHistory(Number.isFinite(limit) ? limit : 20) });
}
