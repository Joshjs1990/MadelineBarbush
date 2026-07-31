import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { SetupForm } from "@/components/admin/SetupForm";
import { countUsers, isAuthConfigured } from "@/lib/auth/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set up admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

/**
 * First-run page.
 *
 * Reachable only while no accounts exist; the matching API route enforces the
 * same condition, so this cannot be used to add an admin later.
 */
export default async function AdminSetupPage() {
  if (!(await isAuthConfigured())) {
    return <AdminUnconfigured />;
  }

  if ((await countUsers().catch(() => 1)) > 0) {
    redirect("/admin/login");
  }

  return (
    <main className="admin-page admin-page--narrow">
      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-title">First account.</h1>
        <p>
          No accounts exist yet. Create the administrator — after this, new users are added from
          inside the admin area.
        </p>
      </section>

      <div className="admin-auth-panel">
        <SetupForm />
      </div>
    </main>
  );
}
