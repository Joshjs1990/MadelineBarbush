import { formatBookingWhen, type Booking, type Client } from "@/lib/bookings/types";
import { googleCalendarUrl } from "@/lib/calendar/ics";

/**
 * Email bodies.
 *
 * Every message is built as text and HTML together — a text part keeps the mail
 * out of spam folders and readable in clients that refuse HTML. The markup is
 * deliberately plain and inline-styled, because email clients strip stylesheets.
 */

const FONT = "font-family:Helvetica,Arial,sans-serif";

function layout(heading: string, body: string) {
  return `<div style="${FONT};background:#000;padding:32px 16px">
  <div style="max-width:560px;margin:0 auto;background:#0b0b09;border:1px solid #2a2a24;padding:28px">
    <p style="${FONT};margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#e8ff2a">Madeleline Barbush</p>
    <h1 style="${FONT};margin:0 0 18px;font-size:24px;line-height:1.15;color:#fff7e8">${heading}</h1>
    ${body}
  </div>
</div>`;
}

function paragraph(text: string) {
  return `<p style="${FONT};margin:0 0 14px;font-size:14px;line-height:1.55;color:#d8d4c8">${text}</p>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="${FONT};display:inline-block;margin:2px 8px 8px 0;padding:11px 16px;border:1px solid #e8ff2a;color:#e8ff2a;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none">${label}</a>`;
}

function detailRows(rows: [string, string][]) {
  return `<table style="${FONT};width:100%;border-collapse:collapse;margin:0 0 18px">${rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="${FONT};padding:8px 12px 8px 0;border-top:1px solid #2a2a24;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8f8a7d;white-space:nowrap;vertical-align:top">${label}</td>
          <td style="${FONT};padding:8px 0;border-top:1px solid #2a2a24;font-size:14px;color:#fff7e8">${value}</td>
        </tr>`,
    )
    .join("")}</table>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type BookingEmailContext = {
  booking: Booking;
  client: Client;
  /** Where the client manages the booking. */
  bookingUrl: string;
  /** Direct download of the invite. */
  icsUrl: string;
  /** Where the admin reviews it. */
  adminUrl: string;
};

function bookingRows(booking: Booking, client?: Client) {
  const rows: [string, string][] = [
    ["When", escapeHtml(formatBookingWhen(booking))],
    ["Length", `${booking.durationMinutes} minutes`],
    ["Reference", escapeHtml(booking.reference)],
  ];

  if (booking.location) rows.splice(2, 0, ["Where", escapeHtml(booking.location)]);
  if (client) rows.push(["Client", escapeHtml(`${client.name || client.email} · ${client.email}`)]);
  if (booking.notes) rows.push(["Notes", escapeHtml(booking.notes)]);

  return rows;
}

function bookingTextLines(booking: Booking, client?: Client) {
  return [
    `What: ${booking.title}`,
    `When: ${formatBookingWhen(booking)}`,
    booking.location ? `Where: ${booking.location}` : "",
    `Length: ${booking.durationMinutes} minutes`,
    `Reference: ${booking.reference}`,
    client ? `Client: ${client.name || client.email} (${client.email})` : "",
    booking.notes ? `Notes: ${booking.notes}` : "",
  ].filter(Boolean);
}

function calendarButtons(context: BookingEmailContext) {
  return `<p style="margin:6px 0 0">
    ${button(googleCalendarUrl(context.booking, context.bookingUrl), "Add to Google Calendar")}
    ${button(context.icsUrl, "Add to Apple / Outlook")}
  </p>`;
}

/* -------------------------------------------------------------------------- */
/* Accounts                                                                   */
/* -------------------------------------------------------------------------- */

export function clientWelcomeEmail(client: Client, bookingUrl: string) {
  const name = client.name || client.email;

  return {
    subject: "Your booking account is ready",
    text: [
      `Hello ${name},`,
      "",
      "Your account is set up. You can request dates, see where each request stands and add confirmed bookings to your calendar.",
      "",
      bookingUrl,
    ].join("\n"),
    html: layout(
      "Your account is ready",
      [
        paragraph(`Hello ${escapeHtml(name)},`),
        paragraph(
          "Your account is set up. You can request dates, see where each request stands and add confirmed bookings to your calendar.",
        ),
        `<p style="margin:6px 0 0">${button(bookingUrl, "Open your bookings")}</p>`,
      ].join(""),
    ),
  };
}

export function adminNewClientEmail(client: Client, adminUrl: string) {
  return {
    subject: `New booking account — ${client.name || client.email}`,
    text: [
      "A new client account was created.",
      "",
      `Name: ${client.name || "—"}`,
      `Email: ${client.email}`,
      client.company ? `Company: ${client.company}` : "",
      client.phone ? `Phone: ${client.phone}` : "",
      "",
      adminUrl,
    ]
      .filter(Boolean)
      .join("\n"),
    html: layout(
      "New booking account",
      [
        detailRows(
          [
            ["Name", escapeHtml(client.name || "—")],
            ["Email", escapeHtml(client.email)],
            client.company ? (["Company", escapeHtml(client.company)] as [string, string]) : null,
            client.phone ? (["Phone", escapeHtml(client.phone)] as [string, string]) : null,
          ].filter(Boolean) as [string, string][],
        ),
        `<p style="margin:6px 0 0">${button(adminUrl, "View clients")}</p>`,
      ].join(""),
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Bookings                                                                   */
/* -------------------------------------------------------------------------- */

export function bookingReceivedEmail(context: BookingEmailContext) {
  const { booking, client } = context;

  return {
    subject: `Request received — ${booking.title}`,
    text: [
      `Hello ${client.name || client.email},`,
      "",
      "Your request is in. It is not confirmed yet — you will get another email once it is accepted or declined.",
      "",
      ...bookingTextLines(booking),
      "",
      context.bookingUrl,
    ].join("\n"),
    html: layout(
      "Request received",
      [
        paragraph(
          "Your request is in. It is <strong>not confirmed yet</strong> — you will get another email once it is accepted or declined.",
        ),
        detailRows(bookingRows(booking)),
        `<p style="margin:6px 0 0">${button(context.bookingUrl, "View your bookings")}</p>`,
      ].join(""),
    ),
  };
}

export function adminNewBookingEmail(context: BookingEmailContext) {
  const { booking, client } = context;

  return {
    subject: `New booking request — ${formatBookingWhen(booking)}`,
    text: [
      "A new booking request needs a decision.",
      "",
      ...bookingTextLines(booking, client),
      "",
      context.adminUrl,
    ].join("\n"),
    html: layout(
      "New booking request",
      [
        paragraph(`<strong>${escapeHtml(booking.title)}</strong>`),
        detailRows(bookingRows(booking, client)),
        `<p style="margin:6px 0 0">${button(context.adminUrl, "Confirm or decline")}</p>`,
      ].join(""),
    ),
    replyTo: client.email,
  };
}

export function bookingConfirmedEmail(context: BookingEmailContext) {
  const { booking, client } = context;

  return {
    subject: `Confirmed — ${booking.title}, ${formatBookingWhen(booking)}`,
    text: [
      `Hello ${client.name || client.email},`,
      "",
      "This booking is confirmed. The invite is attached, and you can add it to your calendar from the link below.",
      "",
      ...bookingTextLines(booking),
      "",
      `Add to Google Calendar: ${googleCalendarUrl(booking, context.bookingUrl)}`,
      `Download the invite: ${context.icsUrl}`,
    ].join("\n"),
    html: layout(
      "Booking confirmed",
      [
        paragraph("This booking is confirmed. The invite is attached to this email."),
        detailRows(bookingRows(booking)),
        calendarButtons(context),
      ].join(""),
    ),
  };
}

export function bookingDeclinedEmail(context: BookingEmailContext) {
  const { booking, client } = context;

  return {
    subject: `Not available — ${booking.title}, ${formatBookingWhen(booking)}`,
    text: [
      `Hello ${client.name || client.email},`,
      "",
      "Unfortunately this date is not available. Do send another — a different day may well work.",
      "",
      ...bookingTextLines(booking),
      "",
      context.bookingUrl,
    ].join("\n"),
    html: layout(
      "That date is not available",
      [
        paragraph("Unfortunately this date is not available. Do send another — a different day may well work."),
        detailRows(bookingRows(booking)),
        `<p style="margin:6px 0 0">${button(context.bookingUrl, "Request another date")}</p>`,
      ].join(""),
    ),
  };
}

export function bookingCancelledEmail(context: BookingEmailContext) {
  const { booking, client } = context;

  return {
    subject: `Cancelled — ${booking.title}, ${formatBookingWhen(booking)}`,
    text: [
      `Hello ${client.name || client.email},`,
      "",
      "This booking has been cancelled and is no longer in the diary.",
      "",
      ...bookingTextLines(booking),
    ].join("\n"),
    html: layout(
      "Booking cancelled",
      [
        paragraph("This booking has been cancelled and is no longer in the diary."),
        detailRows(bookingRows(booking)),
      ].join(""),
    ),
  };
}

export function bookingReminderEmail(context: BookingEmailContext) {
  const { booking, client } = context;

  return {
    subject: `Tomorrow — ${booking.title}, ${formatBookingWhen(booking)}`,
    text: [
      `Hello ${client.name || client.email},`,
      "",
      "A reminder that this is tomorrow.",
      "",
      ...bookingTextLines(booking),
      "",
      context.bookingUrl,
    ].join("\n"),
    html: layout(
      "This is tomorrow",
      [
        paragraph("A reminder that this booking is tomorrow."),
        detailRows(bookingRows(booking)),
        calendarButtons(context),
      ].join(""),
    ),
  };
}

export function adminReminderEmail(context: BookingEmailContext) {
  const { booking, client } = context;

  return {
    subject: `Tomorrow — ${booking.title} with ${client.name || client.email}`,
    text: ["In the diary for tomorrow.", "", ...bookingTextLines(booking, client), "", context.adminUrl].join("\n"),
    html: layout(
      "In the diary for tomorrow",
      [detailRows(bookingRows(booking, client)), `<p style="margin:6px 0 0">${button(context.adminUrl, "Open bookings")}</p>`].join(""),
    ),
    replyTo: client.email,
  };
}
