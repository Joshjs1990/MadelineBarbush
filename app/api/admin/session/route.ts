import {
  clearedSessionCookie,
  readSessionToken,
  sessionCookie,
} from "@/lib/auth/session";
import { authenticate, createSessionToken, destroySessionToken } from "@/lib/auth/store";

export const runtime = "edge";

type Credentials = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: Credentials;

  try {
    body = (await request.json()) as Credentials;
  } catch {
    return Response.json({ error: "Send an email and password." }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return Response.json({ error: "Enter your email and password." }, { status: 400 });
  }

  let result;

  try {
    result = await authenticate(email, password);
  } catch (error) {
    console.error("Sign-in failed", error);
    return Response.json(
      { error: "The account database is unavailable. Try again shortly." },
      { status: 503 },
    );
  }

  if (!result.ok) {
    // One message for both a wrong password and an unknown email: a distinct
    // "no such account" reply would let anyone test which addresses exist.
    return Response.json(
      {
        error:
          result.reason === "disabled"
            ? "This account has been disabled. Ask an administrator to re-enable it."
            : "Those details did not match an account.",
      },
      { status: 401 },
    );
  }

  const { token, expiresAt } = await createSessionToken(
    result.userId,
    request.headers.get("user-agent"),
  );

  return Response.json(
    { data: { ok: true } },
    { headers: { "set-cookie": sessionCookie(request, token, expiresAt) } },
  );
}

export async function DELETE(request: Request) {
  const token = readSessionToken(request);

  if (token) {
    try {
      await destroySessionToken(token);
    } catch (error) {
      // Clearing the cookie still signs the browser out, so report success.
      console.error("Unable to delete session row", error);
    }
  }

  return Response.json(
    { data: { ok: true } },
    { headers: { "set-cookie": clearedSessionCookie(request) } },
  );
}
