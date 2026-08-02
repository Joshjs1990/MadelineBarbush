import { notifyBookingRequested } from "@/lib/bookings/notify";
import { requireClient } from "@/lib/bookings/session";
import { createBooking, listBookingsForClient } from "@/lib/bookings/store";

export const runtime = "edge";

type CreateInput = {
  title?: string;
  startsAt?: string;
  durationMinutes?: number;
  location?: string;
  notes?: string;
};

const MAX_DURATION_MINUTES = 60 * 24;

export async function GET(request: Request) {
  const guard = await requireClient(request);
  if (!guard.ok) return guard.response;

  try {
    return Response.json({ data: await listBookingsForClient(guard.client.id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read your bookings.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const guard = await requireClient(request);
  if (!guard.ok) return guard.response;

  const body = (await request.json()) as CreateInput;
  const title = body.title?.trim() ?? "";
  const startsAt = body.startsAt?.trim() ?? "";

  if (!title) {
    return Response.json({ error: "Say what the booking is for." }, { status: 400 });
  }

  const when = new Date(startsAt);

  if (!startsAt || Number.isNaN(when.getTime())) {
    return Response.json({ error: "Choose a date and time." }, { status: 400 });
  }

  if (when.getTime() <= Date.now()) {
    return Response.json({ error: "Choose a date in the future." }, { status: 400 });
  }

  const durationMinutes = Number(body.durationMinutes ?? 60);

  if (!Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > MAX_DURATION_MINUTES) {
    return Response.json(
      { error: "Choose a length between 15 minutes and 24 hours." },
      { status: 400 },
    );
  }

  try {
    // The status is fixed server-side: a client cannot request its way to
    // confirmed, whatever it puts in the body.
    const booking = await createBooking({
      clientId: guard.client.id,
      title,
      startsAt: when.toISOString(),
      durationMinutes: Math.round(durationMinutes),
      location: body.location,
      notes: body.notes,
      status: "requested",
    });

    await notifyBookingRequested(booking, guard.client);

    return Response.json({ data: booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the request.";
    return Response.json({ error: message }, { status: 503 });
  }
}
