import { requireApiUser } from "@/lib/auth/session";
import { findClientById, setClientDisabled } from "@/lib/bookings/store";

export const runtime = "edge";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const guard = await requireApiUser(request, "admin");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as { disabled?: boolean };

  if (typeof body.disabled !== "boolean") {
    return Response.json({ error: "Send a `disabled` boolean." }, { status: 400 });
  }

  try {
    const client = await findClientById(id);

    if (!client) {
      return Response.json({ error: "That client no longer exists." }, { status: 404 });
    }

    await setClientDisabled(id, body.disabled);
    return Response.json({ data: { id, disabled: body.disabled } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the client.";
    return Response.json({ error: message }, { status: 503 });
  }
}
