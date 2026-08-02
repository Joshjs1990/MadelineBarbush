"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddToCalendar } from "@/components/booking/AddToCalendar";
import { formatBookingWhen, isUpcoming, type Booking, type Client } from "@/lib/bookings/types";

const STATUS_COPY: Record<Booking["status"], string> = {
  requested: "Awaiting confirmation",
  confirmed: "Confirmed",
  declined: "Not available",
  cancelled: "Cancelled",
};

export function ClientBookings({ client, bookings }: { client: Client; bookings: Booking[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const upcoming = bookings.filter((booking) => isUpcoming(booking));
  const past = bookings.filter((booking) => !isUpcoming(booking));

  const signOut = async () => {
    setBusy(true);
    await fetch("/api/client/session", { method: "DELETE" });
    router.replace("/book");
    router.refresh();
  };

  return (
    <div className="booking-account">
      <div className="booking-account__bar">
        <span>
          Signed in as {client.name || client.email}
          {client.company ? ` · ${client.company}` : ""}
        </span>
        <button type="button" onClick={signOut} disabled={busy}>
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>

      <BookingGroup title="Upcoming" bookings={upcoming} empty="Nothing booked yet." />
      {past.length ? <BookingGroup title="Past" bookings={past} empty="" /> : null}
    </div>
  );
}

function BookingGroup({
  title,
  bookings,
  empty,
}: {
  title: string;
  bookings: Booking[];
  empty: string;
}) {
  return (
    <section className="booking-group" aria-label={title}>
      <h2>{title}</h2>

      {bookings.length ? (
        <ul className="admin-list">
          {bookings.map((booking) => (
            <li key={booking.id} className="admin-list__row">
              <div className="admin-list__main">
                <p className="admin-list__meta">
                  {formatBookingWhen(booking, Intl.DateTimeFormat().resolvedOptions().timeZone)}
                </p>
                <h3>{booking.title}</h3>
                <p className="admin-list__slug">
                  {booking.location ? `${booking.location} · ` : ""}
                  {booking.durationMinutes} min · {booking.reference}
                </p>
              </div>

              <div className="admin-list__tags">
                <span data-tone={booking.status}>{STATUS_COPY[booking.status]}</span>
              </div>

              {booking.status === "confirmed" ? (
                <AddToCalendar booking={booking} />
              ) : (
                <div className="admin-list__actions" />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-auth-hint">{empty}</p>
      )}
    </section>
  );
}
