import Image from "next/image";
import { getEditableContent } from "@/lib/assistant/store";

export const dynamic = "force-dynamic";

export default async function BioPage() {
  const content = await getEditableContent();
  return (
    <main className="bio-page bio-page-simple">
      <section className="simple-page-heading"><h1>{content.about.heading}</h1></section>
      <section className="bio-simple-content">
        <div className="bio-simple-portrait"><Image src="/images/maddie-bio.webp" alt="Madeline Barbush" fill sizes="(max-width: 700px) 100vw, 34vw" unoptimized /></div>
        <div className="bio-simple-copy">
          <p>{content.about.intro}</p>
          {content.about.body.split(/\n\s*\n/).map((paragraph, index) => <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>)}
        </div>
      </section>
    </main>
  );
}
