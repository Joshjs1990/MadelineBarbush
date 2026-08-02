import { endsAt, type Booking, type Client } from "@/lib/bookings/types";

/**
 * Calendar export.
 *
 * An `.ics` file covers Apple Calendar, Outlook and anything else that accepts
 * an invite; the Google link covers the case where someone lives in a browser
 * tab and would rather not download a file. Both are offered everywhere a
 * booking is shown.
 */

/** ICS wants `20260814T093000Z` — no punctuation, always UTC. */
function toIcsStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 escaping: commas, semicolons and newlines are structural. */
function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Lines must not exceed 75 octets; long notes get folded. */
function foldLine(line: string) {
  if (line.length <= 74) return line;

  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 74));
  rest = rest.slice(74);

  while (rest.length > 73) {
    parts.push(` ${rest.slice(0, 73)}`);
    rest = rest.slice(73);
  }

  if (rest.length) parts.push(` ${rest}`);
  return parts.join("\r\n");
}

export function buildBookingIcs(
  booking: Booking,
  options: { organiserEmail: string; organiserName: string; client?: Client | null; url?: string },
) {
  const description = [booking.notes, options.url ? `Manage this booking: ${options.url}` : ""]
    .filter(Boolean)
    .join("\n\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Madeleline Barbush//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${booking.id}@madelinebarbush`,
    `DTSTAMP:${toIcsStamp(new Date().toISOString())}`,
    `DTSTART:${toIcsStamp(booking.startsAt)}`,
    `DTEND:${toIcsStamp(endsAt(booking))}`,
    `SUMMARY:${escapeText(booking.title)}`,
    booking.location ? `LOCATION:${escapeText(booking.location)}` : "",
    description ? `DESCRIPTION:${escapeText(description)}` : "",
    options.url ? `URL:${escapeText(options.url)}` : "",
    `ORGANIZER;CN=${escapeText(options.organiserName)}:mailto:${options.organiserEmail}`,
    options.client
      ? `ATTENDEE;CN=${escapeText(options.client.name || options.client.email)};RSVP=FALSE:mailto:${options.client.email}`
      : "",
    // A declined or cancelled booking still opens, but shows as called off.
    `STATUS:${booking.status === "confirmed" ? "CONFIRMED" : booking.status === "requested" ? "TENTATIVE" : "CANCELLED"}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(booking.title)} tomorrow`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  // CRLF line endings are required; some parsers reject bare newlines.
  return lines.map(foldLine).join("\r\n");
}

export function googleCalendarUrl(booking: Booking, url?: string) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: booking.title,
    dates: `${toIcsStamp(booking.startsAt)}/${toIcsStamp(endsAt(booking))}`,
    details: [booking.notes, url ? `Manage this booking: ${url}` : ""].filter(Boolean).join("\n\n"),
  });

  if (booking.location) params.set("location", booking.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsFilename(booking: Booking) {
  const slug = booking.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "booking"}-${booking.reference}.ics`;
}
