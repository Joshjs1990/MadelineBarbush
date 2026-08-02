import { passwordProblem } from "@/lib/auth/password";
import { notifyClientRegistered } from "@/lib/bookings/notify";
import { clientSessionCookie } from "@/lib/bookings/session";
import { createClientSession, registerClient } from "@/lib/bookings/store";

export const runtime = "edge";

type RegisterInput = {
  email?: string;
  name?: string;
  company?: string;
  phone?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: RegisterInput;

  try {
    body = (await request.json()) as RegisterInput;
  } catch {
    return Response.json({ error: "Send an email and password." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email.includes("@")) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const problem = passwordProblem(password);
  if (problem) {
    return Response.json({ error: problem }, { status: 400 });
  }

  try {
    const client = await registerClient({
      email,
      name: body.name,
      company: body.company,
      phone: body.phone,
      password,
    });

    const { token, expiresAt } = await createClientSession(
      client.id,
      request.headers.get("user-agent"),
    );

    // Awaited rather than detached: Workers may not run promises that outlive
    // the response, and a silently dropped welcome email is hard to notice.
    await notifyClientRegistered(client);

    return Response.json(
      { data: { ok: true } },
      { status: 201, headers: { "set-cookie": clientSessionCookie(request, token, expiresAt) } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the account.";
    return Response.json({ error: message }, { status: 400 });
  }
}
