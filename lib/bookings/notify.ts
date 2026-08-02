import { listUsers } from "@/lib/auth/store";
import type { Booking, Client } from "@/lib/bookings/types";
import { buildBookingIcs, icsFilename } from "@/lib/calendar/ics";
import { sendEmailQuietly } from "@/lib/email/resend";
import {
  adminNewBookingEmail,
  adminNewClientEmail,
  adminReminderEmail,
  bookingCancelledEmail,
  bookingConfirmedEmail,
  bookingDeclinedEmail,
  bookingReceivedEmail,
  bookingReminderEmail,
  clientWelcomeEmail,
  type BookingEmailContext,
} from "@/lib/email/templates";
import { absoluteUrl } from "@/lib/utils";
import { actorInfo } from "@/data/projects";

/**
 * Notification orchestration.
 *
 * Every send goes through `sendEmailQuietly`, so a bounced notification cannot
 * roll back the booking that triggered it. The caller decides whether to await;
 * route handlers do, because Workers may not finish detached promises.
 */

const BOOKINGS_URL = absoluteUrl("/book");

function contextFor(booking: Booking, client: Client): BookingEmailContext {
  return {
    booking,
    client,
    bookingUrl: BOOKINGS_URL,
    icsUrl: absoluteUrl(`/api/bookings/${booking.id}/calendar?ref=${booking.reference}`),
    adminUrl: absoluteUrl("/admin/bookings"),
  };
}

function inviteAttachment(booking: Booking, client: Client) {
  return {
    filename: icsFilename(booking),
    content: buildBookingIcs(booking, {
      organiserEmail: actorInfo.email,
      organiserName: actorInfo.name,
      client,
      url: BOOKINGS_URL,
    }),
  };
}

/**
 * Who hears about new accounts and requests: every active administrator.
 *
 * Derived from the account table rather than a configured address, so adding an
 * admin adds them to the notifications without a second place to remember.
 */
async function adminRecipients(): Promise<string[]> {
  try {
    const users = await listUsers();
    const admins = users.filter((user) => user.role === "admin" && !user.disabled);
    return (admins.length ? admins : users.filter((user) => !user.disabled)).map(
      (user) => user.email,
    );
  } catch (error) {
    console.error("Unable to resolve admin notification recipients", error);
    return [];
  }
}

export async function notifyClientRegistered(client: Client) {
  const welcome = clientWelcomeEmail(client, BOOKINGS_URL);
  const admins = await adminRecipients();

  await Promise.all([
    sendEmailQuietly({ to: client.email, ...welcome }),
    admins.length
      ? sendEmailQuietly({
          to: admins,
          replyTo: client.email,
          ...adminNewClientEmail(client, absoluteUrl("/admin/clients")),
        })
      : Promise.resolve(null),
  ]);
}

export async function notifyBookingRequested(booking: Booking, client: Client) {
  const context = contextFor(booking, client);
  const admins = await adminRecipients();

  await Promise.all([
    sendEmailQuietly({ to: client.email, ...bookingReceivedEmail(context) }),
    admins.length
      ? sendEmailQuietly({ to: admins, ...adminNewBookingEmail(context) })
      : Promise.resolve(null),
  ]);
}

export async function notifyBookingConfirmed(booking: Booking, client: Client) {
  const context = contextFor(booking, client);

  await sendEmailQuietly({
    to: client.email,
    ...bookingConfirmedEmail(context),
    // The invite rides along with the confirmation, so accepting it is one tap.
    icsAttachment: inviteAttachment(booking, client),
  });
}

export async function notifyBookingDeclined(booking: Booking, client: Client) {
  await sendEmailQuietly({ to: client.email, ...bookingDeclinedEmail(contextFor(booking, client)) });
}

export async function notifyBookingCancelled(booking: Booking, client: Client) {
  await sendEmailQuietly({
    to: client.email,
    ...bookingCancelledEmail(contextFor(booking, client)),
  });
}

export async function notifyBookingReminder(booking: Booking, client: Client) {
  const context = contextFor(booking, client);
  const admins = await adminRecipients();

  await Promise.all([
    sendEmailQuietly({
      to: client.email,
      ...bookingReminderEmail(context),
      icsAttachment: inviteAttachment(booking, client),
    }),
    admins.length
      ? sendEmailQuietly({ to: admins, ...adminReminderEmail(context) })
      : Promise.resolve(null),
  ]);
}
