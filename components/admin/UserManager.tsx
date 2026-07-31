"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { AdminUser, Role } from "@/lib/auth/store";

type UserManagerProps = {
  users: AdminUser[];
  currentUserId: string;
};

function formatDate(value: string | null) {
  if (!value) return "never signed in";
  const parsed = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(parsed.getTime())) return "never signed in";
  return `last signed in ${parsed.toLocaleDateString()}`;
}

export function UserManager({ users, currentUserId }: UserManagerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const call = async (id: string, request: () => Promise<Response>, success?: string) => {
    setPendingId(id);
    setError(null);
    setNotice(null);

    const response = await request();
    const body = (await response.json().catch(() => ({}))) as { error?: string };

    setPendingId(null);

    if (!response.ok) {
      setError(body.error ?? "That change could not be saved.");
      return false;
    }

    if (success) setNotice(success);
    router.refresh();
    return true;
  };

  const patch = (id: string, changes: Record<string, unknown>, success?: string) =>
    call(
      id,
      () =>
        fetch(`/api/admin/users/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(changes),
        }),
      success,
    );

  const remove = (user: AdminUser) => {
    if (!window.confirm(`Delete the account for ${user.email}?`)) return;
    return call(user.id, () => fetch(`/api/admin/users/${user.id}`, { method: "DELETE" }));
  };

  const resetPassword = (user: AdminUser) => {
    const next = window.prompt(
      `Set a new password for ${user.email}.\nAt least 12 characters, with an uppercase letter, a lowercase letter and a number.`,
    );
    if (!next) return;
    return patch(user.id, { password: next }, `Password updated for ${user.email}.`);
  };

  const createUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setNotice(null);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, role, password }),
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setCreating(false);

    if (!response.ok) {
      setError(body.error ?? "Unable to create the account.");
      return;
    }

    setNotice(`${email} can now sign in. Share the password with them directly.`);
    setName("");
    setEmail("");
    setPassword("");
    setRole("editor");
    router.refresh();
  };

  return (
    <div className="admin-users">
      {error ? (
        <p className="admin-auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="admin-auth-notice" role="status">
          {notice}
        </p>
      ) : null}

      <ul className="admin-list">
        {users.map((user) => {
          const busy = pendingId === user.id;
          const self = user.id === currentUserId;

          return (
            <li key={user.id} className="admin-list__row" data-hidden={user.disabled}>
              <div className="admin-list__main">
                <p className="admin-list__meta">
                  {user.name || "No name"} · {formatDate(user.lastLoginAt)}
                </p>
                <h2>
                  {user.email}
                  {self ? " (you)" : ""}
                </h2>
                <p className="admin-list__slug">{user.role}</p>
              </div>

              <div className="admin-list__tags">
                <span data-tone={user.disabled ? "hidden" : "live"}>
                  {user.disabled ? "Disabled" : "Active"}
                </span>
              </div>

              <div className="admin-list__actions">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => patch(user.id, { role: user.role === "admin" ? "editor" : "admin" })}
                >
                  Make {user.role === "admin" ? "editor" : "admin"}
                </button>
                <button
                  type="button"
                  disabled={busy || (self && !user.disabled)}
                  onClick={() => patch(user.id, { disabled: !user.disabled })}
                >
                  {user.disabled ? "Re-enable" : "Disable"}
                </button>
                <button type="button" disabled={busy} onClick={() => resetPassword(user)}>
                  Set password
                </button>
                <button type="button" disabled={busy || self} onClick={() => remove(user)}>
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="admin-section admin-section--stacked">
        <div>
          <p className="eyebrow">Accounts</p>
          <h2>Add a user</h2>
          <p className="admin-auth-hint">
            Editors can manage case studies. Admins can also manage accounts. Passwords are set here
            and shared directly — there is no invitation email.
          </p>
        </div>

        <form className="admin-auth-form" onSubmit={createUser}>
          <label>
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>
            <span>Temporary password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={creating}>
            {creating ? "Creating…" : "Add user"}
          </button>
        </form>
      </section>
    </div>
  );
}
