import type { Metadata } from "next";
import Link from "next/link";
import { actorInfo } from "@/data/projects";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${actorInfo.name} for roles, collaborations and representation enquiries.`,
};

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-hero" aria-labelledby="contact-title">
        <p className="eyebrow">Contact</p>
        <h1 id="contact-title">For roles, collaborations and representation enquiries.</h1>
      </section>
      <section className="contact-grid" aria-label="Contact details">
        <div className="contact-primary">
          <p>
            Send scripts, casting material, availability checks and meeting requests through email.
            Please include production dates, location, role context and the best contact for follow-up.
          </p>
          <a href={`mailto:${actorInfo.email}`} data-cursor-label="Email">
            {actorInfo.email}
          </a>
        </div>
        <dl>
          <div>
            <dt>Location</dt>
            <dd>{actorInfo.location}</dd>
          </div>
          <div>
            <dt>Representation</dt>
            <dd>{actorInfo.representation}</dd>
          </div>
          <div>
            <dt>Playing age</dt>
            <dd>{actorInfo.playingAge}</dd>
          </div>
          <div>
            <dt>Skills</dt>
            <dd>{actorInfo.skills}</dd>
          </div>
        </dl>
      </section>
      <section className="contact-links" aria-label="Profile and materials links">
        <a href="/downloads/cv.txt" download data-cursor-label="Open">Download CV</a>
        <a href="/downloads/headshots.txt" download data-cursor-label="Open">Download headshots</a>
        <a href={actorInfo.instagram} target="_blank" rel="noreferrer" data-cursor-label="Open">Instagram</a>
        <a href={actorInfo.imdb} target="_blank" rel="noreferrer" data-cursor-label="Open">IMDb</a>
        <a href={actorInfo.spotlight} target="_blank" rel="noreferrer" data-cursor-label="Open">Spotlight</a>
        <Link href="/work" data-cursor-label="Works">Works archive</Link>
      </section>
    </main>
  );
}
