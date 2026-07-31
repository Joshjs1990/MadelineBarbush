import { passwordProblem } from "@/lib/auth/password";
import { sessionCookie } from "@/lib/auth/session";
import { countUsers, createSessionToken, createUser } from "@/lib/auth/store";

export const runtime = "edge";

type SetupInput = {
  email?: string;
  name?: string;
  password?: string;
};

/**
 * Creates the first administrator.
 *
 * Open only while the account table is empty — once any user exists this
 * returns 409, so it cannot be replayed to mint a second unapproved admin.
 */
export async function POST(request: Request) {
  let body: SetupInput;

  try {
    body = (await request.json()) as SetupInput;
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
    if ((await countUsers()) > 0) {
      return Response.json(
        { error: "An administrator already exists. Sign in instead." },
        { status: 409 },
      );
    }

    const userId = await createUser({
      email,
      name: body.name ?? null,
      role: "admin",
      password,
    });

    const { token, expiresAt } = await createSessionToken(
      userId,
      request.headers.get("user-agent"),
    );

    return Response.json(
      { data: { ok: true } },
      { status: 201, headers: { "set-cookie": sessionCookie(request, token, expiresAt) } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the account.";
    return Response.json({ error: message }, { status: 503 });
  }
}
