import { requireApiUser } from "@/lib/auth/session";
import {
  notifyBookingCancelled,
  notifyBookingConfirmed,
  notifyBookingDeclined,
} from "@/lib/bookings/notify";
import {
  deleteBooking,
  findBookingById,
  findClientById,
  setBookingStatus,
  updateBooking,
} from "@/lib/bookings/store";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/bookings/types";

export const runtime = "edge";

type RouteProps = {
  params: Promise<{ id: string }>;
};

type PatchInput = {
  status?: string;
  title?: string;
  startsAt?: string;
  durationMinutes?: number;
  location?: string;
  notes?: string;
};

function isStatus(value: string | undefined): value is BookingStatus {
  return Boolean(value) && BOOKING_STATUSES.includes(value as BookingStatus);
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as PatchInput;

  if (body.status !== undefined && !isStatus(body.status)) {
    return Response.json({ error: "That is not a booking status." }, { status: 400 });
  }

  try {
    const existing = await findBookingById(id);

    if (!existing) {
      return Response.json({ error: "That booking no longer exists." }, { status: 404 });
    }

    let booking = existing;

    if (
      body.title !== undefined ||
      body.startsAt !== undefined ||
      body.durationMinutes !== undefined ||
      body.location !== undefined ||
      body.notes !== undefined
    ) {
      booking = (await updateBooking(id, body)) ?? booking;
    }

    // Only a genuine change of status notifies — re-saving details should not
    // email the client a second confirmation.
    if (body.status && body.status !== existing.status) {
      booking = (await setBookingStatus(id, body.status)) ?? booking;

      const client = await findClientById(booking.clientId);

      if (client) {
        if (body.status === "confirmed") await notifyBookingConfirmed(booking, client);
        if (body.status === "declined") await notifyBookingDeclined(booking, client);
        if (body.status === "cancelled") await notifyBookingCancelled(booking, client);
      }
    }

    return Response.json({ data: booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the booking.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const guard = await requireApiUser(request, "admin");
  if (!guard.ok) return guard.response;

  const { id } = await params;

  try {
    await deleteBooking(id);
    return Response.json({ data: { id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the booking.";
    return Response.json({ error: message }, { status: 503 });
  }
}
