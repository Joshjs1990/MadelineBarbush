"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Mode = "sign-in" | "register";

/**
 * Combined sign-in and registration for clients.
 *
 * One component with a toggle rather than two pages: someone arriving to book a
 * date should not have to work out which form they need first.
 */
export function ClientAuth({ initialMode = "sign-in" }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const registering = mode === "register";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const response = await fetch(registering ? "/api/client/register" : "/api/client/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        registering ? { email, name, company, phone, password } : { email, password },
      ),
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(body.error ?? "That did not work. Try again.");
      setBusy(false);
      return;
    }

    router.replace("/book");
    router.refresh();
  };

  return (
    <div className="booking-auth">
      <div className="booking-auth__tabs" role="tablist" aria-label="Account">
        <button
          type="button"
          role="tab"
          aria-selected={!registering}
          onClick={() => {
            setMode("sign-in");
            setError(null);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={registering}
          onClick={() => {
            setMode("register");
            setError(null);
          }}
        >
          Create an account
        </button>
      </div>

      <form className="admin-auth-form" onSubmit={submit}>
        {error ? (
          <p className="admin-auth-error" role="alert">
            {error}
          </p>
        ) : null}

        {registering ? (
          <>
            <label>
              <span>Your name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>
              <span>Company or production</span>
              <input value={company} onChange={(event) => setCompany(event.target.value)} />
            </label>
            <label>
              <span>Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
          </>
        ) : null}

        <label>
          <span>Email</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            autoComplete={registering ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {registering ? (
          <p className="admin-auth-hint">
            At least 12 characters, with an uppercase letter, a lowercase letter and a number.
          </p>
        ) : null}

        <button type="submit" disabled={busy}>
          {busy ? "Working…" : registering ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
