"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookingWithClient, Client } from "@/lib/bookings/types";

type ClientsListProps = {
  clients: Client[];
  bookings: BookingWithClient[];
};

function formatDate(value: string | null) {
  if (!value) return "never signed in";
  const parsed = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) return "never signed in";
  return `last signed in ${parsed.toLocaleDateString()}`;
}

export function ClientsList({ clients, bookings }: ClientsListProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleDisabled = async (client: Client) => {
    setPendingId(client.id);
    setError(null);

    const response = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ disabled: !client.disabled }),
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPendingId(null);

    if (!response.ok) {
      setError(body.error ?? "That change could not be saved.");
      return;
    }

    router.refresh();
  };

  if (!clients.length) {
    return <p className="admin-empty">No client accounts yet.</p>;
  }

  return (
    <div className="admin-list">
      {error ? (
        <p className="admin-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <ul>
        {clients.map((client) => {
          const theirs = bookings.filter((booking) => booking.clientId === client.id);
          const confirmed = theirs.filter((booking) => booking.status === "confirmed").length;
          const busy = pendingId === client.id;

          return (
            <li key={client.id} className="admin-list__row" data-hidden={client.disabled}>
              <div className="admin-list__main">
                <p className="admin-list__meta">
                  {client.company || "No company"} · {formatDate(client.lastLoginAt)}
                </p>
                <h2>{client.name || client.email}</h2>
                <p className="admin-list__slug">
                  {client.email}
                  {client.phone ? ` · ${client.phone}` : ""}
                </p>
              </div>

              <div className="admin-list__tags">
                <span data-tone={client.disabled ? "hidden" : "live"}>
                  {client.disabled ? "Disabled" : "Active"}
                </span>
                <span data-tone="source">
                  {theirs.length} booking{theirs.length === 1 ? "" : "s"}
                </span>
                {confirmed ? <span data-tone="confirmed">{confirmed} confirmed</span> : null}
              </div>

              <div className="admin-list__actions">
                <a href={`mailto:${client.email}`} data-no-transition>
                  Email
                </a>
                <button type="button" disabled={busy} onClick={() => toggleDisabled(client)}>
                  {client.disabled ? "Re-enable" : "Disable"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
