import { passwordProblem } from "@/lib/auth/password";
import { requireApiUser } from "@/lib/auth/session";
import {
  countActiveAdmins,
  deleteUser,
  findUserById,
  updateUser,
  type AdminUser,
  type Role,
} from "@/lib/auth/store";

export const runtime = "edge";

type RouteProps = {
  params: Promise<{ id: string }>;
};

type PatchInput = {
  role?: string;
  disabled?: boolean;
  name?: string;
  password?: string;
};

function normalizeRole(role: string | undefined): Role | null {
  if (role === "admin" || role === "editor") return role;
  return null;
}

/**
 * Blocks any change that would remove the last way in.
 *
 * Demoting, disabling or deleting the only active administrator would leave the
 * site with no one able to manage accounts, and no way to recover from the UI.
 */
async function wouldStrandTheSite(target: AdminUser, losesAdmin: boolean) {
  if (!losesAdmin) return false;
  if (target.role !== "admin" || target.disabled) return false;
  return (await countActiveAdmins()) <= 1;
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const guard = await requireApiUser(request, "admin");
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = (await request.json()) as PatchInput;

  const role = body.role === undefined ? undefined : normalizeRole(body.role);
  if (body.role !== undefined && !role) {
    return Response.json({ error: "Choose a valid role." }, { status: 400 });
  }

  if (body.password !== undefined) {
    const problem = passwordProblem(body.password);
    if (problem) return Response.json({ error: problem }, { status: 400 });
  }

  try {
    const target = await findUserById(id);

    if (!target) {
      return Response.json({ error: "That account no longer exists." }, { status: 404 });
    }

    if (target.id === guard.user.id && body.disabled) {
      return Response.json({ error: "You cannot disable your own account." }, { status: 400 });
    }

    const losesAdmin = (role !== undefined && role !== "admin") || body.disabled === true;

    if (await wouldStrandTheSite(target, losesAdmin)) {
      return Response.json(
        { error: "This is the only active administrator. Promote someone else first." },
        { status: 400 },
      );
    }

    await updateUser(id, {
      role: role ?? undefined,
      disabled: body.disabled,
      name: body.name,
      password: body.password,
    });

    return Response.json({ data: { id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the account.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const guard = await requireApiUser(request, "admin");
  if (!guard.ok) return guard.response;

  const { id } = await params;

  if (id === guard.user.id) {
    return Response.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  try {
    const target = await findUserById(id);

    if (!target) {
      return Response.json({ error: "That account no longer exists." }, { status: 404 });
    }

    if (await wouldStrandTheSite(target, true)) {
      return Response.json(
        { error: "This is the only active administrator. Promote someone else first." },
        { status: 400 },
      );
    }

    await deleteUser(id);
    return Response.json({ data: { id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the account.";
    return Response.json({ error: message }, { status: 503 });
  }
}
