"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const DURATIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: 240, label: "Half day" },
  { value: 480, label: "Full day" },
];

/** The browser's local time, formatted for `datetime-local`'s value. */
function defaultStart() {
  const date = new Date(Date.now() + 7 * 86_400_000);
  date.setMinutes(0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`;
}

export function BookingRequestForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState(defaultStart);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    // `datetime-local` has no zone, so it reads as local time. Converting here
    // means the server always stores a real instant.
    const when = new Date(startsAt);

    const response = await fetch("/api/client/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        startsAt: Number.isNaN(when.getTime()) ? startsAt : when.toISOString(),
        durationMinutes,
        location,
        notes,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setBusy(false);

    if (!response.ok) {
      setError(body.error ?? "That request could not be sent.");
      return;
    }

    setTitle("");
    setLocation("");
    setNotes("");
    router.refresh();
  };

  return (
    <form className="admin-auth-form booking-form" onSubmit={submit}>
      {error ? (
        <p className="admin-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <label>
        <span>What is it for</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Self-tape, meeting, shoot day"
          required
        />
      </label>

      <label>
        <span>Date and time</span>
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
          required
        />
      </label>

      <label>
        <span>How long</span>
        <select
          value={durationMinutes}
          onChange={(event) => setDurationMinutes(Number(event.target.value))}
        >
          {DURATIONS.map((duration) => (
            <option key={duration.value} value={duration.value}>
              {duration.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Where</span>
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Studio, address or video call"
        />
      </label>

      <label>
        <span>Anything else</span>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
      </label>

      <p className="admin-auth-hint">
        Requests are not confirmed straight away. You will get an email either way, and a calendar
        invite once a date is accepted.
      </p>

      <button type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
