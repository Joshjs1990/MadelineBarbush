import type { Metadata } from "next";
import { actorInfo } from "@/data/projects";
import { ContactForm } from "@/components/contact/ContactForm";
import { getEditableContent } from "@/lib/assistant/store";
import { getVisualMedia } from "@/lib/site-settings/media";
import { EditableImage, EditableRichText, EditableText } from "@/components/editor/Editable";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact", description: "Contact Madeline Barbush for work and representation enquiries." };

export default async function ContactPage() {
  const [content, media] = await Promise.all([getEditableContent(), getVisualMedia()]);
  return (
    <main className="contact-page contact-page-simple">
      <section className="simple-page-heading"><h1><EditableText field="pages.contactHeading">{content.pages.contactHeading}</EditableText></h1></section>
      <section className="contact-layout" aria-label="Contact information and enquiry form">
        <div className="contact-info">
          <EditableRichText field="contact.representation" className="contact-representation" value={content.contact.representation} />
          <div className="contact-simple-photo"><EditableImage field="contact.image" src={media.contact.src} alt={media.contact.alt} focalX={media.contact.focalX} focalY={media.contact.focalY} fit={media.contact.fit} fill sizes="(max-width: 700px) 100vw, 34vw" /></div>
          <a className="contact-simple-email" href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
          {content.contact.phone ? <a className="contact-simple-phone" href={`tel:${content.contact.phone.replace(/[^\d+]/g, "")}`}>{content.contact.phone}</a> : null}
          <EditableRichText field="contact.note" className="contact-simple-note" value={content.contact.note} />
          <nav className="contact-simple-links" aria-label="External profiles">
            <a href={actorInfo.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={actorInfo.actorsAccess} target="_blank" rel="noreferrer">Actors Access</a>
            <a href={actorInfo.imdb} target="_blank" rel="noreferrer">IMDb</a>
          </nav>
        </div>
        <div className="contact-form-panel">
          <h2><EditableText field="contact.formHeading">{content.contact.formHeading}</EditableText></h2>
          <ContactForm recipient={content.contact.email} />
        </div>
      </section>
    </main>
  );
}
