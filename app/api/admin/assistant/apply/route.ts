import { requireApiUser } from "@/lib/auth/session";
import { applyChanges, undoRevision, type ProposedChange } from "@/lib/assistant/store";

export const runtime = "edge";

export async function POST(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;
  const input = await request.json().catch(() => ({})) as { changes?: ProposedChange[]; revisionId?: string };
  try {
    if (input.revisionId) { await undoRevision(guard.user, input.revisionId); return Response.json({ data: { message: "Change undone." } }); }
    if (!Array.isArray(input.changes)) return Response.json({ error: "A proposed change is required." }, { status: 400 });
    const result = await applyChanges(guard.user, input.changes.slice(0, 20));
    return Response.json({ data: { message: "Change applied.", changes: result.changes } });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "That change could not be applied." }, { status: 400 }); }
}
