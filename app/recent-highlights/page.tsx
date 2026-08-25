import type { Metadata } from "next";
import { getRecentHighlights } from "@/lib/site-settings/highlights";
import { getEditableContent } from "@/lib/assistant/store";

export const metadata: Metadata = { title: "Recent Highlights", description: "Recent work, projects and updates from Madeline Barbush." };
export const dynamic = "force-dynamic";

export default async function RecentHighlightsPage() {
  const [html, content] = await Promise.all([getRecentHighlights(), getEditableContent()]);
  return <main className="highlights-page"><section className="simple-page-heading"><h1>{content.pages.recentHighlightsHeading}</h1></section><section className="highlights-page__content" dangerouslySetInnerHTML={{ __html: html }} /></main>;
}
