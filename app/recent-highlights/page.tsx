import type { Metadata } from "next";
import { getRecentHighlights } from "@/lib/site-settings/highlights";

export const metadata: Metadata = { title: "Recent Highlights", description: "Recent work, projects and updates from Madeline Barbush." };
export const dynamic = "force-dynamic";

export default async function RecentHighlightsPage() {
  const html = await getRecentHighlights();
  return <main className="highlights-page"><section className="simple-page-heading"><h1>Recent Highlights</h1></section><section className="highlights-page__content" dangerouslySetInnerHTML={{ __html: html }} /></main>;
}
