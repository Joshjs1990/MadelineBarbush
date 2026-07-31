import { cookies } from "next/headers";
import { resolveSession, SESSION_DAYS, type Role, type SessionUser } from "@/lib/auth/store";

export const SESSION_COOKIE = "mbar_admin_session";

const RANK: Record<Role, number> = { editor: 0, admin: 1 };

export function hasRole(user: SessionUser, minimum: Role) {
  return RANK[user.role] >= RANK[minimum];
}

/**
 * Reads the signed-in user for a server component.
 *
 * Every call re-checks the database rather than trusting the cookie alone, so a
 * signed-out session or a disabled account stops working immediately.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await resolveSession(token);
  } catch (error) {
    console.error("Unable to resolve admin session", error);
    return null;
  }
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    return decodeURIComponent(part.slice(separator + 1).trim());
  }

  return null;
}

/**
 * Reads the signed-in user for a route handler.
 *
 * Route handlers are directly invocable endpoints — the fact that only the
 * admin UI calls them is not an access control, so each one guards itself.
 */
export async function getSessionUserFromRequest(request: Request): Promise<SessionUser | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;

  try {
    return await resolveSession(token);
  } catch (error) {
    console.error("Unable to resolve admin session", error);
    return null;
  }
}

export type Guarded =
  | { ok: true; user: SessionUser }
  | { ok: false; response: Response };

export async function requireApiUser(request: Request, minimum: Role = "editor"): Promise<Guarded> {
  const user = await getSessionUserFromRequest(request);

  if (!user) {
    return {
      ok: false,
      response: Response.json({ error: "Sign in to continue." }, { status: 401 }),
    };
  }

  if (!hasRole(user, minimum)) {
    return {
      ok: false,
      response: Response.json(
        { error: "Your account does not have access to this action." },
        { status: 403 },
      ),
    };
  }

  return { ok: true, user };
}

/** `Secure` is dropped over plain http so sign-in still works on localhost. */
function isSecureRequest(request: Request) {
  return new URL(request.url).protocol === "https:";
}

export function sessionCookie(request: Request, token: string, expiresAt: Date) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_DAYS * 86_400}`,
    `Expires=${expiresAt.toUTCString()}`,
  ];

  if (isSecureRequest(request)) parts.push("Secure");
  return parts.join("; ");
}

export function clearedSessionCookie(request: Request) {
  const parts = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (isSecureRequest(request)) parts.push("Secure");
  return parts.join("; ");
}

export function readSessionToken(request: Request) {
  return readCookie(request, SESSION_COOKIE);
}
