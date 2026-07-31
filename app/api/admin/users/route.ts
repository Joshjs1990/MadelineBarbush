import { passwordProblem } from "@/lib/auth/password";
import { requireApiUser } from "@/lib/auth/session";
import { createUser, listUsers, type Role } from "@/lib/auth/store";

export const runtime = "edge";

type CreateInput = {
  email?: string;
  name?: string;
  role?: string;
  password?: string;
};

function normalizeRole(role: string | undefined): Role | null {
  if (role === "admin" || role === "editor") return role;
  return null;
}

export async function GET(request: Request) {
  const guard = await requireApiUser(request, "admin");
  if (!guard.ok) return guard.response;

  try {
    return Response.json({ data: await listUsers() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read accounts.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const guard = await requireApiUser(request, "admin");
  if (!guard.ok) return guard.response;

  const body = (await request.json()) as CreateInput;
  const email = body.email?.trim().toLowerCase() ?? "";
  const role = normalizeRole(body.role);
  const password = body.password ?? "";

  if (!email.includes("@")) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!role) {
    return Response.json({ error: "Choose a role." }, { status: 400 });
  }

  const problem = passwordProblem(password);
  if (problem) {
    return Response.json({ error: problem }, { status: 400 });
  }

  try {
    const id = await createUser({ email, name: body.name ?? null, role, password });
    return Response.json({ data: { id } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the account.";
    return Response.json({ error: message }, { status: 400 });
  }
}
