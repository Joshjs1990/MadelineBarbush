"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AddToCalendar } from "@/components/booking/AddToCalendar";
import {
  formatBookingWhen,
  isUpcoming,
  type BookingStatus,
  type BookingWithClient,
} from "@/lib/bookings/types";

type View = "list" | "calendar";

const STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Builds the grid for a month, padded to whole weeks starting Monday, so the
 * calendar always renders as complete rows.
 */
function monthGrid(month: Date) {
  const first = startOfMonth(month);
  // getDay() is Sunday-based; shift so Monday is column zero.
  const leading = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - leading);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function BookingsBoard({ bookings }: { bookings: BookingWithClient[] }) {
  const router = useRouter();
  const [view, setView] = useState<View>("list");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all" | "upcoming">("upcoming");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (statusFilter === "all") return bookings;
    if (statusFilter === "upcoming") {
      return bookings.filter(
        (booking) =>
          isUpcoming(booking) && booking.status !== "cancelled" && booking.status !== "declined",
      );
    }
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const byDay = useMemo(() => {
    const map = new Map<string, BookingWithClient[]>();
    for (const booking of bookings) {
      const day = new Date(booking.startsAt);
      const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
      map.set(key, [...(map.get(key) ?? []), booking]);
    }
    return map;
  }, [bookings]);

  const counts = useMemo(
    () => ({
      requested: bookings.filter((booking) => booking.status === "requested").length,
      confirmed: bookings.filter(
        (booking) => booking.status === "confirmed" && isUpcoming(booking),
      ).length,
    }),
    [bookings],
  );

  const setStatus = async (id: string, status: BookingStatus) => {
    setPendingId(id);
    setError(null);

    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPendingId(null);

    if (!response.ok) {
      setError(body.error ?? "That change could not be saved.");
      return;
    }

    router.refresh();
  };

  const grid = monthGrid(month);
  const today = new Date();

  return (
    <div className="crm">
      <div className="crm__toolbar">
        <div className="crm__stats">
          <span>
            <strong>{counts.requested}</strong> awaiting a decision
          </span>
          <span>
            <strong>{counts.confirmed}</strong> confirmed upcoming
          </span>
        </div>

        <div className="crm__views" role="tablist" aria-label="View">
          <button type="button" role="tab" aria-selected={view === "list"} onClick={() => setView("list")}>
            List
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "calendar"}
            onClick={() => setView("calendar")}
          >
            Calendar
          </button>
        </div>
      </div>

      {error ? (
        <p className="admin-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      {view === "list" ? (
        <>
          <div className="crm__filters">
            {(["upcoming", "requested", "confirmed", "declined", "cancelled", "all"] as const).map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={statusFilter === filter}
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter}
                </button>
              ),
            )}
          </div>

          {visible.length ? (
            <ul className="admin-list">
              {visible.map((booking) => (
                <li key={booking.id} className="admin-list__row">
                  <div className="admin-list__main">
                    <p className="admin-list__meta">{formatBookingWhen(booking)}</p>
                    <h2>{booking.title}</h2>
                    <p className="admin-list__slug">
                      {booking.client?.name || booking.client?.email || "Unknown client"}
                      {booking.client?.company ? ` · ${booking.client.company}` : ""}
                      {booking.location ? ` · ${booking.location}` : ""} · {booking.reference}
                    </p>
                    {booking.notes ? <p className="crm__notes">{booking.notes}</p> : null}
                  </div>

                  <div className="admin-list__tags">
                    <span data-tone={booking.status}>{STATUS_LABEL[booking.status]}</span>
                    {booking.remindedAt ? <span data-tone="source">Reminded</span> : null}
                  </div>

                  <div className="admin-list__actions">
                    {booking.status !== "confirmed" ? (
                      <button
                        type="button"
                        disabled={pendingId === booking.id}
                        onClick={() => setStatus(booking.id, "confirmed")}
                      >
                        Confirm
                      </button>
                    ) : null}
                    {booking.status === "requested" ? (
                      <button
                        type="button"
                        disabled={pendingId === booking.id}
                        onClick={() => setStatus(booking.id, "declined")}
                      >
                        Decline
                      </button>
                    ) : null}
                    {booking.status === "confirmed" ? (
                      <button
                        type="button"
                        disabled={pendingId === booking.id}
                        onClick={() => setStatus(booking.id, "cancelled")}
                      >
                        Cancel
                      </button>
                    ) : null}
                    {booking.client ? (
                      <a href={`mailto:${booking.client.email}`} data-no-transition>
                        Email
                      </a>
                    ) : null}
                    <AddToCalendar booking={booking} compact />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-empty">Nothing here.</p>
          )}
        </>
      ) : (
        <div className="crm__calendar">
          <div className="crm__month">
            <button
              type="button"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            >
              ← Previous
            </button>
            <strong>
              {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </strong>
            <button
              type="button"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            >
              Next →
            </button>
          </div>

          <div className="crm__weekdays" aria-hidden="true">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="crm__grid">
            {grid.map((day) => {
              const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
              const dayBookings = byDay.get(key) ?? [];

              return (
                <div
                  key={key}
                  className="crm__day"
                  data-outside={day.getMonth() !== month.getMonth() || undefined}
                  data-today={sameDay(day, today) || undefined}
                >
                  <span className="crm__date">{day.getDate()}</span>
                  {dayBookings.map((booking) => (
                    <span key={booking.id} className="crm__chip" data-tone={booking.status}>
                      <strong>
                        {new Date(booking.startsAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>{" "}
                      {booking.title}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
