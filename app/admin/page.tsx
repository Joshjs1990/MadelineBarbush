import type { Metadata } from "next";
import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <main className="admin-page">
      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-title">Case-study editor.</h1>
        <p>
          Add performance work with structured credit fields, image rows, YouTube embeds
          and long-form case-study text.
        </p>
      </section>
      <CaseStudyEditor />
    </main>
  );
}
