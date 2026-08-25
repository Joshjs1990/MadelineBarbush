import { requireApiUser } from "@/lib/auth/session";
import { getRecentHighlights, saveRecentHighlights } from "@/lib/site-settings/highlights";
export const runtime = "edge";
export async function GET(request: Request) { const guard = await requireApiUser(request); if (!guard.ok) return guard.response; return Response.json({ data: { html: await getRecentHighlights() } }); }
export async function PUT(request: Request) { const guard = await requireApiUser(request); if (!guard.ok) return guard.response; const body = await request.json().catch(() => ({})) as { html?: string }; if (typeof body.html !== "string" || body.html.length > 24000) return Response.json({ error: "Enter recent highlights using the editor." }, { status: 400 }); try { return Response.json({ data: { html: await saveRecentHighlights(body.html) } }); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Highlights could not be saved." }, { status: 400 }); } }
