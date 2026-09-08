import { requireApiUser } from "@/lib/auth/session";
import { applyChanges, type ProposedChange } from "@/lib/assistant/store";

export const runtime = "edge";

/** Manual editor write path. The old assistant route remains isolated for compatibility. */
export async function POST(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const input = await request.json().catch(() => ({})) as { changes?: ProposedChange[] };
  if (!Array.isArray(input.changes)) return Response.json({ error: "A content change is required." }, { status: 400 });
  try {
    const result = await applyChanges(guard.user, input.changes.slice(0, 20));
    return Response.json({ data: { message: "Your changes were saved.", changes: result.changes } }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Those changes could not be saved." }, { status: 400, headers: { "cache-control": "no-store" } });
  }
}
