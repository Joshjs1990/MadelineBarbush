import type { Metadata } from "next";
import { actorInfo } from "@/data/projects";
import { ContactForm } from "@/components/contact/ContactForm";
import { getEditableContent } from "@/lib/assistant/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact", description: "Contact Madeline Barbush for work and representation enquiries." };

export default async function ContactPage() {
  const content = await getEditableContent();
  return (
    <main className="contact-page contact-page-simple">
      <section className="simple-page-heading"><h1>{content.pages.contactHeading}</h1></section>
      <section className="contact-layout" aria-label="Contact information and enquiry form">
        <div className="contact-info">
          <div className="contact-representation">
            {content.contact.representation.split(/\n\s*\n/).map((block, index) => <p key={`${block.slice(0, 24)}-${index}`}>{block.split("\n").map((line, lineIndex) => <span key={`${line}-${lineIndex}`}>{lineIndex ? <br /> : null}{line}</span>)}</p>)}
          </div>
          <a className="contact-simple-email" href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
          {content.contact.phone ? <a className="contact-simple-phone" href={`tel:${content.contact.phone.replace(/[^\d+]/g, "")}`}>{content.contact.phone}</a> : null}
          <p className="contact-simple-note">{content.contact.note}</p>
          <nav className="contact-simple-links" aria-label="External profiles">
            <a href={actorInfo.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={actorInfo.actorsAccess} target="_blank" rel="noreferrer">Actors Access</a>
            <a href={actorInfo.imdb} target="_blank" rel="noreferrer">IMDb</a>
          </nav>
        </div>
        <div className="contact-form-panel">
          <h2>{content.contact.formHeading}</h2>
          <ContactForm recipient={content.contact.email} />
        </div>
      </section>
    </main>
  );
}
