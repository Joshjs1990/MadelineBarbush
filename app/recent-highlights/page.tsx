import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recent Highlights", description: "Recent work, projects and updates from Madeline Barbush." };

export default function RecentHighlightsPage() {
  return <main className="highlights-page"><section className="simple-page-heading"><h1>Recent Highlights</h1></section><section className="highlights-page__empty"><p>Recent updates coming soon.</p></section></main>;
}
