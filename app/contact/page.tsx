import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact", description: "Contact Madeline Barbush for work and representation enquiries." };

export default function ContactPage() {
  return (
    <main className="contact-page contact-page-simple">
      <section className="simple-page-heading"><h1>Contact</h1></section>
      <section className="contact-simple-content">
        <p>For roles, collaborations and general enquiries:</p>
        <a className="contact-simple-email" href="mailto:Madeline.Barbush@gmail.com">Madeline.Barbush@gmail.com</a>
        <p className="contact-simple-note">Commercial representation: Tracey Goldblum at BBR Talent Agency. Madeline is currently seeking theatrical representation.</p>
      </section>
    </main>
  );
}
