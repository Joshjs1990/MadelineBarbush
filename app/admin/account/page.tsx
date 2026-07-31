import type { Metadata } from "next";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { resolveAdminAccess } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminAccountPage() {
  const access = await resolveAdminAccess();

  if (access.state === "unconfigured") {
    return <AdminUnconfigured />;
  }

  return (
    <main className="admin-page admin-page--narrow">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Account</p>
        <h1 id="admin-title">Your password.</h1>
        <p>
          Signed in as {access.user.email} ({access.user.role}).
        </p>
      </section>

      <div className="admin-auth-panel">
        <PasswordForm />
      </div>
    </main>
  );
}
