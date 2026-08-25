import type { Metadata } from "next";
import Link from "next/link";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { CaseStudyList } from "@/components/admin/CaseStudyList";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { listCaseStudiesForAdmin } from "@/lib/case-studies/store";
import { WebsiteAssistant } from "@/components/admin/WebsiteAssistant";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminPage() {
  const access = await resolveAdminAccess();

  if (access.state === "unconfigured") {
    return <AdminUnconfigured />;
  }

  const entries = await listCaseStudiesForAdmin();
  const live = entries.filter((entry) => !entry.hidden).length;

  return (
    <main className="admin-page">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-title">Case studies.</h1>
        <p>
          {live} live of {entries.length}. Edit any entry, hide it from the site, or{" "}
          <Link href="/admin/case-studies/new">add a new one</Link>.
        </p>
      </section>

      <WebsiteAssistant />

      <CaseStudyList entries={entries} />
    </main>
  );
}
