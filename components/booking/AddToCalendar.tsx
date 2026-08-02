"use client";

import type { Booking } from "@/lib/bookings/types";
import { googleCalendarUrl } from "@/lib/calendar/ics";

/**
 * Add-to-calendar links.
 *
 * Google gets a pre-filled template URL; everything else takes the `.ics`, which
 * Apple Calendar, Outlook and Fantastical all import. The reference is on the
 * `.ics` link so it keeps working from an email client that sends no cookies.
 */
export function AddToCalendar({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const ics = `/api/bookings/${booking.id}/calendar?ref=${encodeURIComponent(booking.reference)}`;

  return (
    <div className="add-to-calendar" data-compact={compact || undefined}>
      <a href={googleCalendarUrl(booking)} target="_blank" rel="noreferrer" data-no-transition>
        Google Calendar
      </a>
      <a href={ics} download data-no-transition>
        Apple / Outlook
      </a>
    </div>
  );
}
