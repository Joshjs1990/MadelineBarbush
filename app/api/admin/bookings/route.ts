import { requireApiUser } from "@/lib/auth/session";
import { notifyBookingConfirmed, notifyBookingRequested } from "@/lib/bookings/notify";
import { createBooking, findClientById, listBookingsWithClients } from "@/lib/bookings/store";

export const runtime = "edge";

type CreateInput = {
  clientId?: string;
  title?: string;
  startsAt?: string;
  durationMinutes?: number;
  location?: string;
  notes?: string;
  status?: string;
};

export async function GET(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  try {
    return Response.json({ data: await listBookingsWithClients() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read bookings.";
    return Response.json({ error: message }, { status: 503 });
  }
}

/** Bookings entered on a client's behalf — a call taken, a date pencilled in. */
export async function POST(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  const body = (await request.json()) as CreateInput;
  const clientId = body.clientId?.trim() ?? "";
  const title = body.title?.trim() ?? "";
  const when = new Date(body.startsAt ?? "");

  if (!clientId) {
    return Response.json({ error: "Choose a client." }, { status: 400 });
  }

  if (!title) {
    return Response.json({ error: "Say what the booking is for." }, { status: 400 });
  }

  if (Number.isNaN(when.getTime())) {
    return Response.json({ error: "Choose a date and time." }, { status: 400 });
  }

  const status = body.status === "confirmed" ? "confirmed" : "requested";

  try {
    const client = await findClientById(clientId);

    if (!client) {
      return Response.json({ error: "That client no longer exists." }, { status: 404 });
    }

    const booking = await createBooking({
      clientId,
      title,
      startsAt: when.toISOString(),
      durationMinutes: Math.round(Number(body.durationMinutes ?? 60)) || 60,
      location: body.location,
      notes: body.notes,
      status,
    });

    // A booking entered as already confirmed sends the confirmation and the
    // invite straight away, rather than waiting to be confirmed a second time.
    if (status === "confirmed") {
      await notifyBookingConfirmed(booking, client);
    } else {
      await notifyBookingRequested(booking, client);
    }

    return Response.json({ data: booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the booking.";
    return Response.json({ error: message }, { status: 503 });
  }
}
