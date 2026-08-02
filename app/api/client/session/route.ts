import {
  clearedClientSessionCookie,
  clientSessionCookie,
  readClientToken,
} from "@/lib/bookings/session";
import {
  authenticateClient,
  createClientSession,
  destroyClientSession,
} from "@/lib/bookings/store";

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
    result = await authenticateClient(email, password);
  } catch (error) {
    console.error("Client sign-in failed", error);
    return Response.json(
      { error: "The booking system is unavailable. Try again shortly." },
      { status: 503 },
    );
  }

  if (!result.ok) {
    // One message for both wrong password and unknown email.
    return Response.json(
      {
        error:
          result.reason === "disabled"
            ? "This account has been disabled. Get in touch if that is unexpected."
            : "Those details did not match an account.",
      },
      { status: 401 },
    );
  }

  const { token, expiresAt } = await createClientSession(
    result.clientId,
    request.headers.get("user-agent"),
  );

  return Response.json(
    { data: { ok: true } },
    { headers: { "set-cookie": clientSessionCookie(request, token, expiresAt) } },
  );
}

export async function DELETE(request: Request) {
  const token = readClientToken(request);

  if (token) {
    try {
      await destroyClientSession(token);
    } catch (error) {
      console.error("Unable to delete client session row", error);
    }
  }

  return Response.json(
    { data: { ok: true } },
    { headers: { "set-cookie": clearedClientSessionCookie(request) } },
  );
}
