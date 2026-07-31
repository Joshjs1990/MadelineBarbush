import { passwordProblem } from "@/lib/auth/password";
import { clearedSessionCookie, requireApiUser } from "@/lib/auth/session";
import { authenticate, updateUser } from "@/lib/auth/store";

export const runtime = "edge";

type PasswordInput = {
  current?: string;
  password?: string;
};

/**
 * Changes the signed-in user's own password.
 *
 * The current password is re-checked even though the session is valid, so a
 * borrowed session cannot lock the real owner out. Every session is revoked on
 * success, including this one.
 */
export async function POST(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  const body = (await request.json()) as PasswordInput;
  const problem = passwordProblem(body.password ?? "");

  if (problem) {
    return Response.json({ error: problem }, { status: 400 });
  }

  try {
    const check = await authenticate(guard.user.email, body.current ?? "");

    if (!check.ok) {
      return Response.json({ error: "Your current password is incorrect." }, { status: 400 });
    }

    await updateUser(guard.user.id, { password: body.password });

    return Response.json(
      { data: { ok: true } },
      { headers: { "set-cookie": clearedSessionCookie(request) } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to change the password.";
    return Response.json({ error: message }, { status: 503 });
  }
}
