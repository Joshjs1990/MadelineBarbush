import type { Metadata } from "next";
import { actorInfo } from "@/data/projects";

export const metadata: Metadata = { title: "Contact", description: "Contact Madeline Barbush for work and representation enquiries." };

export default function ContactPage() {
  return (
    <main className="contact-page contact-page-simple">
      <section className="simple-page-heading"><h1>Contact</h1></section>
      <section className="contact-simple-content">
        <p>For roles, collaborations and general enquiries:</p>
        <a className="contact-simple-email" href={`mailto:${actorInfo.email}`}>{actorInfo.email}</a>
        <nav className="contact-simple-links" aria-label="External profiles">
          <a href={actorInfo.instagram} target="_blank" rel="noreferrer">Instagram</a>
          <a href={actorInfo.actorsAccess} target="_blank" rel="noreferrer">Actors Access</a>
          <a href={actorInfo.imdb} target="_blank" rel="noreferrer">IMDb</a>
        </nav>
        <p className="contact-simple-note">Commercial representation: Tracey Goldblum at BBR Talent Agency. Madeline is currently seeking theatrical representation.</p>
      </section>
    </main>
  );
}
