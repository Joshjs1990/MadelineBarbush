import Image from "next/image";
import { getEditableContent } from "@/lib/assistant/store";

export const dynamic = "force-dynamic";

function Credits({ items }: { items: string[][] }) { return <div className="resume-simple-list">{items.map(([title, role, detail]) => <div key={title}><strong>{title}</strong><span>{role}</span><small>{detail}</small></div>)}</div>; }
function rows(value: string) { return value.split("\n").map((line) => line.split("|").map((part) => part.trim())).filter((parts) => parts[0]); }

export default async function ResumePage() {
  const content = await getEditableContent();
  return (
    <main className="resume-page resume-page-simple">
      <section className="resume-simple-intro">
        <section className="simple-page-heading"><h1>{content.pages.resumeHeading}</h1><p>{content.resume.intro}</p><p><a href={`mailto:${content.contact.email}`}>{content.contact.email}</a> · {content.contact.phone} · Equity · 5&apos;5&quot;</p><a className="resume-download" href="/downloads/resume.pdf" download>Download resume PDF</a></section>
        <section className="resume-simple-photo"><Image src="/images/maddie-resume.webp" alt="Madeline Barbush" fill sizes="(max-width: 700px) 100vw, 22rem" unoptimized /></section>
      </section>
      <section className="resume-simple-grid">
        <section><h2>Theater</h2><Credits items={rows(content.resume.theater)} /><h2>Staged readings</h2><div className="resume-simple-list">{rows(content.resume.stagedReadings).map(([title, detail]) => <div key={title}><strong>{title}</strong><small>{detail}</small></div>)}</div></section>
        <section><h2>Film + screen</h2><Credits items={rows(content.resume.film)} /><h2>Training</h2><div className="resume-simple-list">{rows(content.resume.training).map(([name, detail]) => <div key={name}><strong>{name}</strong><small>{detail}</small></div>)}</div><h2>Special skills</h2><p>{content.resume.skills}</p></section>
      </section>
    </main>
  );
}
