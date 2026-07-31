import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { findCaseStudyForAdmin, listCaseStudiesForAdmin } from "@/lib/case-studies/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit case study",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type EditCaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditCaseStudyPage({ params }: EditCaseStudyPageProps) {
  const access = await resolveAdminAccess();

  if (access.state === "unconfigured") {
    return <AdminUnconfigured />;
  }

  const { slug } = await params;
  const [entry, entries] = await Promise.all([
    findCaseStudyForAdmin(slug),
    listCaseStudiesForAdmin(),
  ]);

  if (!entry) {
    notFound();
  }

  return (
    <main className="admin-page">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">{entry.hidden ? "Hidden" : "Live"}</p>
        <h1 id="admin-title">{entry.project.title}</h1>
        <p>
          Editing {entry.stored ? "a saved entry" : "a built-in entry — saving creates an editable copy"}.{" "}
          <Link href={`/work/${entry.project.slug}`}>View on the site</Link>
        </p>
      </section>

      <CaseStudyEditor
        entry={entry}
        relatedOptions={entries
          .filter((option) => option.project.slug !== entry.project.slug)
          .map((option) => ({ slug: option.project.slug, title: option.project.title }))}
      />
    </main>
  );
}
