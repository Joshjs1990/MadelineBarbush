import type { Metadata } from "next";
import { getRecentHighlights } from "@/lib/site-settings/highlights";
import { getEditableContent } from "@/lib/assistant/store";
import { getVisualMedia } from "@/lib/site-settings/media";
import { EditableImage, EditableText } from "@/components/editor/Editable";

export const metadata: Metadata = { title: "Recent Highlights", description: "Recent work, projects and updates from Madeline Barbush." };
export const dynamic = "force-dynamic";

export default async function RecentHighlightsPage() {
  const [html, content, media] = await Promise.all([getRecentHighlights(), getEditableContent(), getVisualMedia()]);
  return <main className="highlights-page"><section className="highlights-page__hero"><div className="simple-page-heading"><h1><EditableText field="pages.recentHighlightsHeading">{content.pages.recentHighlightsHeading}</EditableText></h1></div><div className="highlights-page__intro" data-editable-field="recentHighlights.content" data-editable-kind="richText" dangerouslySetInnerHTML={{ __html: html }} /></section><section className="highlights-page__images" aria-label="Recent highlight images"><figure className="highlights-image highlights-image--primary"><EditableImage field="recentHighlights.primaryImage" src={media.recentPrimary.src} alt={media.recentPrimary.alt} focalX={media.recentPrimary.focalX} focalY={media.recentPrimary.focalY} fit={media.recentPrimary.fit} fill sizes="(max-width: 700px) 100vw, 62vw" /></figure><figure className="highlights-image highlights-image--secondary"><EditableImage field="recentHighlights.secondaryImage" src={media.recentSecondary.src} alt={media.recentSecondary.alt} focalX={media.recentSecondary.focalX} focalY={media.recentSecondary.focalY} fit={media.recentSecondary.fit} fill sizes="(max-width: 700px) 100vw, 48vw" /></figure></section></main>;
}
