import type { Metadata } from "next";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { ClientsList } from "@/components/admin/ClientsList";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { listBookingsWithClients, listClients } from "@/lib/bookings/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clients",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminClientsPage() {
  const access = await resolveAdminAccess();

  if (access.state === "unconfigured") {
    return <AdminUnconfigured />;
  }

  const [clients, bookings] = await Promise.all([listClients(), listBookingsWithClients()]);

  return (
    <main className="admin-page">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">People</p>
        <h1 id="admin-title">Clients.</h1>
        <p>
          {clients.length} {clients.length === 1 ? "account" : "accounts"} with booking access.
        </p>
      </section>

      <ClientsList clients={clients} bookings={bookings} />
    </main>
  );
}
