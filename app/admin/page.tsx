import type { Metadata } from "next";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { SiteColours } from "@/components/admin/SiteColours";
import { SiteSettings } from "@/components/admin/SiteSettings";
import { ChangeHistory } from "@/components/admin/ChangeHistory";
import { getEditableContent } from "@/lib/assistant/store";
import { getGlobalTypography } from "@/lib/site-settings/typography";

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

  const [content, globalTypography] = await Promise.all([getEditableContent(), getGlobalTypography()]);

  return (
    <main className="admin-page">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section id="overview" className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-title">Website dashboard.</h1>
        <p>
          Manage your content, images and limited theme palette without changing the designed layouts.
        </p>
      </section>

      <nav className="admin-section-nav" aria-label="Dashboard sections">
        <a href="/admin/editor">Edit Site</a><a href="#colours">Site Colours</a><a href="#settings">Site Settings</a><a href="#history">Change History</a>
      </nav>

      {/* The old WebsiteAssistant is intentionally not rendered here. Content changes now use the predictable visual editor. */}
      <section id="colours"><SiteColours content={content} /></section>
      <section id="settings"><SiteSettings content={content} globalTypography={globalTypography} /></section>
      <section id="history"><details className="admin-collapsible"><summary>Change History</summary><ChangeHistory /></details></section>
    </main>
  );
}
