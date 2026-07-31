"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/** Self-service password change. Succeeding signs every session out. */
export function PasswordForm() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirm) {
      setError("The two new passwords do not match.");
      return;
    }

    setBusy(true);
    setError(null);

    const response = await fetch("/api/admin/account/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ current, password }),
    });

    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(body.error ?? "Unable to change the password.");
      setBusy(false);
      return;
    }

    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <form className="admin-auth-form" onSubmit={submit}>
      {error ? (
        <p className="admin-auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <label>
        <span>Current password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          required
        />
      </label>

      <label>
        <span>New password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      <label>
        <span>Confirm new password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
        />
      </label>

      <p className="admin-auth-hint">
        Changing your password signs you out everywhere, including this browser.
      </p>

      <button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
