import type { Metadata } from "next";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { VisualEditor } from "@/components/admin/VisualEditor";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { getEditableContent } from "@/lib/assistant/store";
import { getVisualMedia } from "@/lib/site-settings/media";
import { getTextSizing } from "@/lib/site-settings/typography";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Site", robots: { index: false, follow: false, nocache: true } };

export default async function VisualEditorPage() {
  const access = await resolveAdminAccess();
  if (access.state === "unconfigured") return <AdminUnconfigured />;
  const [content, media, textSizing] = await Promise.all([getEditableContent(), getVisualMedia(), getTextSizing()]);
  return <main className="admin-page"><AdminBar email={access.user.email} role={access.user.role} /><section className="admin-hero"><p className="eyebrow">Visual editor</p><h1>Edit site.</h1><p>Change the content inside the existing design. Layout, typography and motion stay protected.</p></section><VisualEditor content={content} media={media} textSizing={textSizing} /></main>;
}
