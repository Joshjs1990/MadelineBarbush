import type { Metadata } from "next";
import Link from "next/link";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { CaseStudyList } from "@/components/admin/CaseStudyList";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { listCaseStudiesForAdmin } from "@/lib/case-studies/store";
import { WebsiteAssistant } from "@/components/admin/WebsiteAssistant";
import { SiteColours } from "@/components/admin/SiteColours";
import { SiteSettings } from "@/components/admin/SiteSettings";
import { ChangeHistory } from "@/components/admin/ChangeHistory";
import { getEditableContent } from "@/lib/assistant/store";

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

  const [entries, content] = await Promise.all([listCaseStudiesForAdmin(), getEditableContent()]);
  const live = entries.filter((entry) => !entry.hidden).length;

  return (
    <main className="admin-page">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section id="overview" className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-title">Website dashboard.</h1>
        <p>
          {live} live case studies of {entries.length}. Manage your copy, colours, settings and portfolio entries from one place. {" "}
          <Link href="/admin/case-studies/new">add a new one</Link>.
        </p>
      </section>

      <nav className="admin-section-nav" aria-label="Dashboard sections">
        <a href="#overview">Overview</a><a href="#copy">Website Copy</a><a href="#colours">Site Colours</a><a href="#settings">Site Settings</a><a href="#history">Change History</a><a href="#case-studies">Case studies</a>
      </nav>

      <section id="copy" className="admin-dashboard-section"><WebsiteAssistant /></section>
      <section id="colours"><SiteColours content={content} /></section>
      <section id="settings"><SiteSettings content={content} /></section>
      <section id="history"><ChangeHistory /></section>

      <section id="case-studies"><CaseStudyList entries={entries} /></section>
    </main>
  );
}
