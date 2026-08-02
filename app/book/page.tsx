import type { Metadata } from "next";
import { BookingRequestForm } from "@/components/booking/BookingRequestForm";
import { ClientAuth } from "@/components/booking/ClientAuth";
import { ClientBookings } from "@/components/booking/ClientBookings";
import { getSessionClient } from "@/lib/bookings/session";
import { isBookingConfigured, listBookingsForClient } from "@/lib/bookings/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking",
  description: "Request a date, track where it stands and add confirmed bookings to your calendar.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function BookPage() {
  const configured = await isBookingConfigured();
  const client = configured ? await getSessionClient() : null;
  const bookings = client ? await listBookingsForClient(client.id) : [];

  return (
    <main className="booking-page">
      <section className="booking-hero" aria-labelledby="booking-title">
        <p className="eyebrow">Booking</p>
        <h1 id="booking-title">Request a date.</h1>
        <p>
          Availability for meetings, self-tapes and shoot days. Requests are reviewed personally —
          you will hear back by email either way.
        </p>
      </section>

      {!configured ? (
        <p className="admin-empty">
          Booking is not connected yet. Please email in the meantime.
        </p>
      ) : client ? (
        <div className="booking-grid">
          <ClientBookings client={client} bookings={bookings} />
          <aside className="booking-aside" aria-label="New request">
            <h2>New request</h2>
            <BookingRequestForm />
          </aside>
        </div>
      ) : (
        <div className="booking-grid booking-grid--auth">
          <ClientAuth />
          <aside className="booking-aside" aria-label="How it works">
            <h2>How it works</h2>
            <ol className="booking-steps">
              <li>Create an account, so you can see where a request stands.</li>
              <li>Send a date, a length and anything useful about the job.</li>
              <li>You get an email when it is accepted or declined.</li>
              <li>Confirmed dates come with a calendar invite and a reminder the day before.</li>
            </ol>
          </aside>
        </div>
      )}
    </main>
  );
}
