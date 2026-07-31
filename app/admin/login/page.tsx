import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSessionUser } from "@/lib/auth/session";
import { countUsers, isAuthConfigured } from "@/lib/auth/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminLoginPage() {
  if (!(await isAuthConfigured())) {
    return <AdminUnconfigured />;
  }

  // Nobody can sign in before the first administrator exists.
  if ((await countUsers().catch(() => 1)) === 0) {
    redirect("/admin/setup");
  }

  if (await getSessionUser()) {
    redirect("/admin");
  }

  return (
    <main className="admin-page admin-page--narrow">
      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-title">Sign in.</h1>
        <p>Case-study editing for Madeleline Barbush.</p>
      </section>

      <div className="admin-auth-panel">
        <LoginForm />
        <Link className="admin-auth-back" href="/">
          Back to the site
        </Link>
      </div>
    </main>
  );
}
