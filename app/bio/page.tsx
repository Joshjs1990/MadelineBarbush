import { getEditableContent } from "@/lib/assistant/store";
import { getVisualMedia } from "@/lib/site-settings/media";
import { EditableImage, EditableRichText, EditableText } from "@/components/editor/Editable";

export const dynamic = "force-dynamic";

export default async function BioPage() {
  const [content, media] = await Promise.all([getEditableContent(), getVisualMedia()]);
  return (
    <main className="bio-page bio-page-simple">
      <section className="simple-page-heading"><h1><EditableText field="about.heading">{content.about.heading}</EditableText></h1></section>
      <section className="bio-simple-content">
        <div className="bio-simple-portrait"><EditableImage field="bio.image" src={media.bio.src} alt={media.bio.alt} focalX={media.bio.focalX} focalY={media.bio.focalY} fit={media.bio.fit} fill sizes="(max-width: 700px) 100vw, 34vw" /></div>
        <div className="bio-simple-copy">
          <EditableRichText field="about.intro" value={content.about.intro} />
          <EditableRichText field="about.body" value={content.about.body} />
        </div>
      </section>
    </main>
  );
}
