import type { Metadata } from "next";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { listCaseStudiesForAdmin } from "@/lib/case-studies/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New case study",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function NewCaseStudyPage() {
  const access = await resolveAdminAccess();

  if (access.state === "unconfigured") {
    return <AdminUnconfigured />;
  }

  const entries = await listCaseStudiesForAdmin();
  const nextOrder = entries.reduce((highest, entry) => Math.max(highest, entry.project.order), 0) + 1;

  return (
    <main className="admin-page">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Case study</p>
        <h1 id="admin-title">New entry.</h1>
        <p>
          Add performance work with structured credit fields, image rows, YouTube embeds and
          long-form case-study text.
        </p>
      </section>

      <CaseStudyEditor
        relatedOptions={entries.map((entry) => ({
          slug: entry.project.slug,
          title: entry.project.title,
        }))}
        nextOrder={nextOrder}
      />
    </main>
  );
}
