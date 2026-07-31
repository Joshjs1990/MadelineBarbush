import type { Metadata } from "next";
import { AdminBar } from "@/components/admin/AdminBar";
import { AdminUnconfigured } from "@/components/admin/AdminUnconfigured";
import { UserManager } from "@/components/admin/UserManager";
import { resolveAdminAccess } from "@/lib/auth/guard";
import { listUsers } from "@/lib/auth/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Users",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminUsersPage() {
  // Admin-only: `resolveAdminAccess` sends editors back to the case-study list,
  // and the user API routes re-check the same thing.
  const access = await resolveAdminAccess("admin");

  if (access.state === "unconfigured") {
    return <AdminUnconfigured />;
  }

  const users = await listUsers();

  return (
    <main className="admin-page">
      <AdminBar email={access.user.email} role={access.user.role} />

      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Accounts</p>
        <h1 id="admin-title">Users.</h1>
        <p>
          {users.length} {users.length === 1 ? "account" : "accounts"}. Editors manage case studies;
          admins also manage accounts.
        </p>
      </section>

      <UserManager users={users} currentUserId={access.user.id} />
    </main>
  );
}
