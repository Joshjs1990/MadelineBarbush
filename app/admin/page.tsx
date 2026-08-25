import type { Metadata } from "next";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { WebsiteAssistant } from "@/components/admin/WebsiteAssistant";
import { SiteColours } from "@/components/admin/SiteColours";
import { SiteSettings } from "@/components/admin/SiteSettings";
import { ChangeHistory } from "@/components/admin/ChangeHistory";
import { getEditableContent } from "@/lib/assistant/store";
import { PageEditor } from "@/components/admin/PageEditor";

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

  const content = await getEditableContent();

  return (
    <main className="admin-page">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section id="overview" className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-title">Website dashboard.</h1>
        <p>
          Manage your page copy, colours, settings and recent highlights from one place.
        </p>
      </section>

      <nav className="admin-section-nav" aria-label="Dashboard sections">
        <a href="#overview">Overview</a><a href="#copy">Website Copy</a><a href="#highlights">Recent Highlights</a><a href="#colours">Site Colours</a><a href="#settings">Site Settings</a><a href="#history">Change History</a>
      </nav>

      <section id="copy" className="admin-dashboard-section"><WebsiteAssistant /></section>
      <PageEditor content={content} />
      <section id="colours"><SiteColours content={content} /></section>
      <section id="settings"><SiteSettings content={content} /></section>
      <section id="history"><details className="admin-collapsible"><summary>Change History</summary><ChangeHistory /></details></section>
    </main>
  );
}
