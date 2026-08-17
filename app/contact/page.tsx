import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact", description: "Contact Madeline Barbush for work and representation enquiries." };

const contactTypes = [
  { value: "Casting", label: "Film + theatre roles" },
  { value: "Ideas", label: "Writing + collaborations" },
  { value: "Agency", label: "Commercial representation" },
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-intro" aria-labelledby="contact-title">
        <div className="contact-intro-copy">
          <p className="eyebrow">Contact</p>
          <h1 id="contact-title">Let&apos;s work<br />together.</h1>
          <p className="contact-lede">For roles, collaborations, and representation enquiries, get in touch by email.</p>
        </div>
        <div className="contact-intro-note">
          <span>01 / Open door</span>
          <p>Madeline works across film and theater, and writes to make more room for complicated, darkly funny stories.</p>
        </div>
      </section>

      <section className="contact-stats" aria-label="Contact types">
        {contactTypes.map((item) => (
          <div key={item.value}><strong>{item.value}</strong><span>{item.label}</span></div>
        ))}
      </section>

      <section className="contact-details" aria-labelledby="contact-details-title">
        <div className="contact-details-heading">
          <p className="eyebrow">Start a conversation</p>
          <h2 id="contact-details-title">Say<br />hello.</h2>
        </div>
        <div className="contact-details-body">
          <p className="contact-details-lede">For roles, collaborations and general enquiries:</p>
          <a className="contact-email" href="mailto:Madeline.Barbush@gmail.com">Madeline.Barbush@gmail.com</a>
          <div className="contact-representation">
            <p className="eyebrow">Commercial representation</p>
            <h3>BBR Talent Agency<br />Tracey Goldblum</h3>
            <p>Madeline is currently seeking theatrical representation.</p>
          </div>
        </div>
      </section>

      <section className="contact-note">
        <p className="eyebrow">Good to know</p>
        <p>Based in New York City · From Pennsylvania · English + Spanish</p>
      </section>
    </main>
  );
}
