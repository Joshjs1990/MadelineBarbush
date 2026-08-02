/**
 * Booking and client shapes.
 *
 * Kept free of any D1 import so client components can use the types without
 * pulling the database into the browser bundle.
 */

export type BookingStatus = "requested" | "confirmed" | "declined" | "cancelled";

export const BOOKING_STATUSES: BookingStatus[] = [
  "requested",
  "confirmed",
  "declined",
  "cancelled",
];

export type Booking = {
  id: string;
  reference: string;
  clientId: string;
  title: string;
  /** ISO-8601 UTC instant the booking starts. */
  startsAt: string;
  durationMinutes: number;
  location: string;
  notes: string;
  status: BookingStatus;
  remindedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  disabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

/** A booking with the client attached, for the admin CRM views. */
export type BookingWithClient = Booking & { client: Client | null };

export function endsAt(booking: Pick<Booking, "startsAt" | "durationMinutes">) {
  return new Date(
    new Date(booking.startsAt).getTime() + booking.durationMinutes * 60_000,
  ).toISOString();
}

export function isUpcoming(booking: Pick<Booking, "startsAt">, now = new Date()) {
  return new Date(booking.startsAt).getTime() >= now.getTime();
}

const LONG_DATE: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
};

/** One formatting helper, so emails and screens never disagree about a time. */
export function formatBookingWhen(booking: Pick<Booking, "startsAt">, timeZone = "UTC") {
  return new Intl.DateTimeFormat("en-GB", { ...LONG_DATE, timeZone }).format(
    new Date(booking.startsAt),
  );
}
