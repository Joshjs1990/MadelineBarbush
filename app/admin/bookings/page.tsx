import type { Metadata } from "next";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { BookingsBoard } from "@/components/admin/BookingsBoard";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { listBookingsWithClients } from "@/lib/bookings/store";
import { isEmailConfigured } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bookings",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminBookingsPage() {
  const access = await resolveAdminAccess();

  if (access.state === "unconfigured") {
    return <AdminUnconfigured />;
  }

  const [bookings, emailReady] = await Promise.all([
    listBookingsWithClients(),
    isEmailConfigured(),
  ]);

  return (
    <main className="admin-page">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Diary</p>
        <h1 id="admin-title">Bookings.</h1>
        <p>Confirm or decline requests, and see the month at a glance.</p>
      </section>

      {!emailReady ? (
        <p className="admin-notice">
          <code>RESEND_API_KEY</code> is not set, so notification emails are logged rather than
          sent. Bookings still save and the calendar invites still work.
        </p>
      ) : null}

      <BookingsBoard bookings={bookings} />
    </main>
  );
}
