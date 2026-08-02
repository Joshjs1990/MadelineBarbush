import { notifyBookingReminder } from "@/lib/bookings/notify";
import { listBookingsNeedingReminder, markReminded } from "@/lib/bookings/store";
import { getEnvValue } from "@/lib/env";

export const runtime = "edge";

/**
 * Day-before reminders.
 *
 * Meant to be called on a schedule — cron-job.org, a GitHub Action, a
 * Cloudflare cron trigger, anything that can make an authenticated POST. Safe to
 * call as often as you like: each booking carries `reminded_at`, which is set
 * before the send is considered done, so a second run in the same window is a
 * no-op rather than a second email.
 *
 * The window is deliberately generous (24–48 hours out) so an hourly or even
 * daily schedule still catches everything.
 */

const WINDOW_START_HOURS = 24;
const WINDOW_END_HOURS = 48;

/** Constant-time compare, so the secret cannot be guessed a character at a time. */
function secretMatches(provided: string, expected: string) {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let index = 0; index < provided.length; index += 1) {
    diff |= provided.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return diff === 0;
}

async function authorize(request: Request) {
  const expected = await getEnvValue("CRON_SECRET");

  if (!expected) {
    return { ok: false as const, status: 503, error: "CRON_SECRET is not set." };
  }

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!provided || !secretMatches(provided, expected)) {
    return { ok: false as const, status: 401, error: "Not authorised." };
  }

  return { ok: true as const };
}

export async function POST(request: Request) {
  const auth = await authorize(request);

  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const now = Date.now();
  const windowStart = new Date(now + WINDOW_START_HOURS * 3_600_000);
  const windowEnd = new Date(now + WINDOW_END_HOURS * 3_600_000);

  try {
    const due = await listBookingsNeedingReminder(windowStart, windowEnd);
    const sent: string[] = [];
    const skipped: string[] = [];

    for (const booking of due) {
      if (!booking.client || booking.client.disabled) {
        skipped.push(booking.reference);
        continue;
      }

      // Marked before sending: a duplicate email is worse than a missed one, and
      // a crash mid-send would otherwise re-notify everyone on the next run.
      await markReminded(booking.id);
      await notifyBookingReminder(booking, booking.client);
      sent.push(booking.reference);
    }

    return Response.json({
      data: {
        window: { from: windowStart.toISOString(), to: windowEnd.toISOString() },
        considered: due.length,
        sent,
        skipped,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send reminders.";
    return Response.json({ error: message }, { status: 503 });
  }
}
