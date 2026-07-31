import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { countUsers, isAuthConfigured, type Role, type SessionUser } from "@/lib/auth/store";

/**
 * Page-level access control for the admin area.
 *
 * The route handlers guard themselves independently — this only decides what
 * the browser is shown, because a page render is never the thing that protects
 * a mutation.
 */
export type AdminAccess =
  | { state: "unconfigured" }
  | { state: "ready"; user: SessionUser };

export async function resolveAdminAccess(minimum: Role = "editor"): Promise<AdminAccess> {
  if (!(await isAuthConfigured())) {
    return { state: "unconfigured" };
  }

  const user = await getSessionUser();

  if (!user) {
    // With no accounts at all the first visit should set one up, not stare at a
    // sign-in form nobody can pass.
    const total = await countUsers().catch(() => 0);
    redirect(total === 0 ? "/admin/setup" : "/admin/login");
  }

  if (minimum === "admin" && user.role !== "admin") {
    redirect("/admin");
  }

  return { state: "ready", user };
}
