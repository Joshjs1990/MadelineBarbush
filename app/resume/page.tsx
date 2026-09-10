import { getEditableContent } from "@/lib/assistant/store";
import { fieldValue } from "@/lib/assistant/registry";
import { getVisualMedia } from "@/lib/site-settings/media";
import { EditableImage, EditableRichText, EditableText } from "@/components/editor/Editable";
import { richTextHtml } from "@/lib/content/rich-text";

export const dynamic = "force-dynamic";

function Credits({ items }: { items: string[][] }) { return <div className="resume-simple-list">{items.map(([title, role, detail]) => <div key={title}><strong dangerouslySetInnerHTML={{ __html: richTextHtml(title) }} /><span>{role}</span><small>{detail}</small></div>)}</div>; }
function rows(value: string) { return value.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<\/p>\s*<p[^>]*>/gi, "\n").replace(/<\/?p[^>]*>/gi, "").split("\n").map((line) => line.split("|").map((part) => part.trim())).filter((parts) => parts[0]); }

export default async function ResumePage() {
  const [content, media] = await Promise.all([getEditableContent(), getVisualMedia()]);
  return (
    <main className="resume-page resume-page-simple">
      <section className="resume-simple-intro">
        <section className="simple-page-heading"><h1><EditableText field="pages.resumeHeading">{content.pages.resumeHeading}</EditableText></h1><EditableRichText field="resume.intro" value={content.resume.intro} /><p><a href={`mailto:${content.contact.email}`}>{content.contact.email}</a> · {content.contact.phone} · Equity · 5&apos;5&quot;</p><a className="resume-download" href="/downloads/resume.pdf" download>Download resume PDF</a></section>
        <section className="resume-simple-headshots" aria-label="Headshots"><div className="resume-simple-photo resume-simple-photo--large"><EditableImage field="resume.primaryImage" src={media.resumePrimary.src} alt={media.resumePrimary.alt} focalX={media.resumePrimary.focalX} focalY={media.resumePrimary.focalY} fit={media.resumePrimary.fit} fill sizes="(max-width: 700px) 100vw, 22rem" /></div><div className="resume-simple-photo resume-simple-photo--small"><EditableImage field="resume.secondaryImage" src={media.resumeSecondary.src} alt={media.resumeSecondary.alt} focalX={media.resumeSecondary.focalX} focalY={media.resumeSecondary.focalY} fit={media.resumeSecondary.fit} fill sizes="(max-width: 700px) 70vw, 14rem" /></div></section>
      </section>
      <section className="resume-simple-grid">
        <section><h2><EditableText field="resume.theaterHeading">{fieldValue(content, "resume.theaterHeading")}</EditableText></h2><div data-editable-field="resume.theater" data-editable-kind="richText"><Credits items={rows(content.resume.theater)} /></div><h2><EditableText field="resume.stagedReadingsHeading">{fieldValue(content, "resume.stagedReadingsHeading")}</EditableText></h2><div className="resume-simple-list" data-editable-field="resume.stagedReadings" data-editable-kind="richText">{rows(content.resume.stagedReadings).map(([title, detail]) => <div key={title}><strong dangerouslySetInnerHTML={{ __html: richTextHtml(title) }} /><small>{detail}</small></div>)}</div></section>
        <section><h2><EditableText field="resume.filmHeading">{fieldValue(content, "resume.filmHeading")}</EditableText></h2><div data-editable-field="resume.film" data-editable-kind="richText"><Credits items={rows(content.resume.film)} /></div><h2><EditableText field="resume.trainingHeading">{fieldValue(content, "resume.trainingHeading")}</EditableText></h2><div className="resume-simple-list" data-editable-field="resume.training" data-editable-kind="richText">{rows(content.resume.training).map(([name, detail]) => <div key={name}><strong dangerouslySetInnerHTML={{ __html: richTextHtml(name) }} /><small>{detail}</small></div>)}</div><h2><EditableText field="resume.skillsHeading">{fieldValue(content, "resume.skillsHeading")}</EditableText></h2><EditableRichText field="resume.skills" value={content.resume.skills} /></section>
      </section>
    </main>
  );
}
