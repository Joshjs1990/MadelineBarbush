import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { resolveAdminAccess } from "@/lib/auth/guard";
export const dynamic = "force-dynamic";
export default async function MediaPage() { const access = await resolveAdminAccess(); if (access.state === "unconfigured") return <AdminUnconfigured />; return <main className="admin-page"><AdminBar email={access.user.email} role={access.user.role} /><section className="admin-hero"><p className="eyebrow">Media</p><h1>Media library.</h1><p>Upload files once, then choose where they appear.</p></section><MediaLibrary /></main>; }
