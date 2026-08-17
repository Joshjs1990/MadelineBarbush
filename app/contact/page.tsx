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

      <section className="contact-stats" aria-label="Contact types">
        {contactTypes.map((item) => (
          <div key={item.value}><strong>{item.value}</strong><span>{item.label}</span></div>
        ))}
      </section>

      <section className="contact-faq" aria-labelledby="contact-faq-title">
        <div className="contact-faq-heading">
          <p className="eyebrow">Good to know</p>
          <h2 id="contact-faq-title">FAQ</h2>
        </div>
        <div className="contact-faq-list">
          <details open>
            <summary>What are you available for?</summary>
            <p>Madeline works in film and theater, and is open to acting roles, staged work, readings, writing collaborations, and short-film projects.</p>
          </details>
          <details>
            <summary>How should I get in touch?</summary>
            <p>Email <a href="mailto:Madeline.Barbush@gmail.com">Madeline.Barbush@gmail.com</a> with the project, role, dates, and any relevant materials or links.</p>
          </details>
          <details>
            <summary>Are you represented?</summary>
            <p>Madeline&apos;s commercial agent is Tracey Goldblum at BBR Talent Agency. She is currently seeking theatrical representation.</p>
          </details>
        </div>
      </section>

      <section className="contact-note">
        <p className="eyebrow">Good to know</p>
        <p>Based in New York City · From Pennsylvania · English + Spanish</p>
      </section>
    </main>
  );
}
