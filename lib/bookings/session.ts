import { cookies } from "next/headers";
import { CLIENT_SESSION_DAYS, resolveClientSession } from "@/lib/bookings/store";
import type { Client } from "@/lib/bookings/types";

export const CLIENT_SESSION_COOKIE = "mbar_client_session";

/**
 * Client-side-of-the-desk sessions.
 *
 * Mirrors the admin session helpers but with its own cookie and its own table,
 * so a client session can never satisfy an admin guard.
 */

export async function getSessionClient(): Promise<Client | null> {
  try {
    const store = await cookies();
    const token = store.get(CLIENT_SESSION_COOKIE)?.value;
    if (!token) return null;
    return await resolveClientSession(token);
  } catch (error) {
    console.error("Unable to resolve client session", error);
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

export function readClientToken(request: Request) {
  return readCookie(request, CLIENT_SESSION_COOKIE);
}

export async function getSessionClientFromRequest(request: Request): Promise<Client | null> {
  const token = readClientToken(request);
  if (!token) return null;

  try {
    return await resolveClientSession(token);
  } catch (error) {
    console.error("Unable to resolve client session", error);
    return null;
  }
}

export type ClientGuard =
  | { ok: true; client: Client }
  | { ok: false; response: Response };

export async function requireClient(request: Request): Promise<ClientGuard> {
  const client = await getSessionClientFromRequest(request);

  if (!client) {
    return {
      ok: false,
      response: Response.json({ error: "Sign in to continue." }, { status: 401 }),
    };
  }

  return { ok: true, client };
}

/** `Secure` is dropped over plain http so sign-in still works on localhost. */
function isSecureRequest(request: Request) {
  return new URL(request.url).protocol === "https:";
}

export function clientSessionCookie(request: Request, token: string, expiresAt: Date) {
  const parts = [
    `${CLIENT_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${CLIENT_SESSION_DAYS * 86_400}`,
    `Expires=${expiresAt.toUTCString()}`,
  ];

  if (isSecureRequest(request)) parts.push("Secure");
  return parts.join("; ");
}

export function clearedClientSessionCookie(request: Request) {
  const parts = [`${CLIENT_SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (isSecureRequest(request)) parts.push("Secure");
  return parts.join("; ");
}
