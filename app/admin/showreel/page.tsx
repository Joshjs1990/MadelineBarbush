import type { Metadata } from "next";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { ShowreelEditor } from "@/components/admin/ShowreelEditor";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { getShowreel } from "@/lib/site-settings/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Showreel",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminShowreelPage() {
  const access = await resolveAdminAccess();

  if (access.state === "unconfigured") {
    return <AdminUnconfigured />;
  }

  const showreel = await getShowreel();

  return (
    <main className="admin-page">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Homepage</p>
        <h1 id="admin-title">Showreel.</h1>
        <p>The reel block at the bottom of the homepage — the video, the label and the holding frame.</p>
      </section>

      <ShowreelEditor showreel={showreel} />
    </main>
  );
}
