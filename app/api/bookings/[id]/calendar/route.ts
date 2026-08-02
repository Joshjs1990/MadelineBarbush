import { getSessionUserFromRequest } from "@/lib/auth/session";
import { getSessionClientFromRequest } from "@/lib/bookings/session";
import { findBookingById, findClientById } from "@/lib/bookings/store";
import { buildBookingIcs, icsFilename } from "@/lib/calendar/ics";
import { actorInfo } from "@/data/projects";

export const runtime = "edge";

type RouteProps = {
  params: Promise<{ id: string }>;
};

/**
 * Downloads a booking as a calendar invite.
 *
 * Three ways in, because this URL has to work from a mail client that carries
 * no cookies: the owning client's session, any admin session, or the booking's
 * own reference as `?ref=`. The reference is a 6-character random code that is
 * only ever sent to the people already on the booking, and it grants nothing
 * beyond reading that one event.
 */
export async function GET(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const reference = new URL(request.url).searchParams.get("ref");

  let booking;

  try {
    booking = await findBookingById(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read the booking.";
    return Response.json({ error: message }, { status: 503 });
  }

  if (!booking) {
    return Response.json({ error: "Booking not found." }, { status: 404 });
  }

  const byReference = Boolean(reference) && reference === booking.reference;
  const client = byReference ? null : await getSessionClientFromRequest(request);
  const admin = byReference || client ? null : await getSessionUserFromRequest(request);

  if (!byReference && client?.id !== booking.clientId && !admin) {
    return Response.json({ error: "Not your booking." }, { status: 403 });
  }

  const owner = await findClientById(booking.clientId).catch(() => null);

  const ics = buildBookingIcs(booking, {
    organiserEmail: actorInfo.email,
    organiserName: actorInfo.name,
    client: owner,
    url: new URL("/book", request.url).toString(),
  });

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${icsFilename(booking)}"`,
      // Personal and reachable by reference — never let a proxy hold a copy.
      "cache-control": "private, no-store",
    },
  });
}
