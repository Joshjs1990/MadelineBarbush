import type { Metadata } from "next";
import { getRecentHighlights } from "@/lib/site-settings/highlights";
import { getEditableContent } from "@/lib/assistant/store";
import { getVisualMedia } from "@/lib/site-settings/media";
import { EditableImage, EditableText } from "@/components/editor/Editable";

export const metadata: Metadata = { title: "Recent Highlights", description: "Recent work, projects and updates from Madeline Barbush." };
export const dynamic = "force-dynamic";

export default async function RecentHighlightsPage() {
  const [html, content, media] = await Promise.all([getRecentHighlights(), getEditableContent(), getVisualMedia()]);
  return (
    <main className="highlights-page highlights-page-simple">
      <section className="simple-page-heading">
        <h1><EditableText field="pages.recentHighlightsHeading">{content.pages.recentHighlightsHeading}</EditableText></h1>
      </section>
      <section className="highlights-simple-layout" aria-label="Recent highlight content and images">
        <section
          className="highlights-simple-content"
          data-editable-field="recentHighlights.content"
          data-editable-kind="richText"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <figure className="highlights-simple-image highlights-simple-image--primary">
          <EditableImage field="recentHighlights.primaryImage" src={media.recentPrimary.src} alt={media.recentPrimary.alt} focalX={media.recentPrimary.focalX} focalY={media.recentPrimary.focalY} fit={media.recentPrimary.fit} fill sizes="(max-width: 700px) 100vw, 38vw" />
        </figure>
        <figure className="highlights-simple-image highlights-simple-image--secondary">
          <EditableImage field="recentHighlights.secondaryImage" src={media.recentSecondary.src} alt={media.recentSecondary.alt} focalX={media.recentSecondary.focalX} focalY={media.recentSecondary.focalY} fit={media.recentSecondary.fit} fill sizes="(max-width: 700px) 100vw, 78vw" />
        </figure>
      </section>
    </main>
  );
}
