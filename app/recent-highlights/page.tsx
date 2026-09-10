import type { Metadata } from "next";
import { getRecentHighlights } from "@/lib/site-settings/highlights";
import { getEditableContent } from "@/lib/assistant/store";
import { EditableText } from "@/components/editor/Editable";

export const metadata: Metadata = { title: "Recent Highlights", description: "Recent work, projects and updates from Madeline Barbush." };
export const dynamic = "force-dynamic";

export default async function RecentHighlightsPage() {
  const [html, content] = await Promise.all([getRecentHighlights(), getEditableContent()]);
  return (
    <main className="highlights-page highlights-page-simple">
      <section className="simple-page-heading">
        <h1><EditableText field="pages.recentHighlightsHeading">{content.pages.recentHighlightsHeading}</EditableText></h1>
      </section>
      <section
        className="highlights-simple-content"
        data-editable-field="recentHighlights.content"
        data-editable-kind="richText"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
