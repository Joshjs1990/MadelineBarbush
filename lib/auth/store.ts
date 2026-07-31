import { getD1 } from "@/lib/d1";
import {
  generateToken,
  hashPassword,
  hashToken,
  needsRehash,
  verifyPassword,
} from "@/lib/auth/password";

/**
 * User and session records in D1.
 *
 * The schema is created on demand, matching the case-study store, because this
 * hosting setup deploys without running Drizzle migrations against the remote
 * database.
 */

export type Role = "admin" | "editor";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  disabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password_hash: string;
  disabled: number;
  last_login_at: string | null;
  created_at: string;
};

export const SESSION_DAYS = 7;

/**
 * A dummy hash compared against when the email is unknown, so a missing account
 * takes the same time as a wrong password and the endpoint cannot be used to
 * enumerate addresses.
 */
const DUMMY_HASH =
  "pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

let schemaReady: Promise<void> | null = null;

async function initializeSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      role TEXT NOT NULL DEFAULT 'editor',
      password_hash TEXT NOT NULL,
      disabled INTEGER NOT NULL DEFAULT 0,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS admin_sessions_user_idx ON admin_sessions (user_id)"),
  ]);
}

async function getReadyD1() {
  const db = await getD1();
  if (!db) return null;

  schemaReady ??= initializeSchema(db);

  try {
    await schemaReady;
  } catch (error) {
    // Let the next request retry rather than caching a transient failure.
    schemaReady = null;
    throw error;
  }

  return db;
}

/** Throws when D1 is unavailable — every auth path needs a real database. */
async function requireD1() {
  const db = await getReadyD1();
  if (!db) {
    throw new Error("D1 binding `DB` is required for admin accounts.");
  }
  return db;
}

export async function isAuthConfigured() {
  return (await getD1()) !== null;
}

function normalizeRole(role: string): Role {
  return role === "admin" ? "admin" : "editor";
}

function rowToUser(row: UserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: normalizeRole(row.role),
    disabled: Boolean(row.disabled),
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };
}

export async function countUsers() {
  const db = await requireD1();
  const row = await db
    .prepare("SELECT COUNT(*) AS total FROM admin_users")
    .first<{ total: number }>();
  return row?.total ?? 0;
}

export async function countActiveAdmins() {
  const db = await requireD1();
  const row = await db
    .prepare("SELECT COUNT(*) AS total FROM admin_users WHERE role = 'admin' AND disabled = 0")
    .first<{ total: number }>();
  return row?.total ?? 0;
}

export async function listUsers(): Promise<AdminUser[]> {
  const db = await requireD1();
  const result = await db
    .prepare("SELECT * FROM admin_users ORDER BY created_at ASC")
    .all<UserRow>();
  return result.results.map(rowToUser);
}

export async function findUserById(id: string) {
  const db = await requireD1();
  const row = await db.prepare("SELECT * FROM admin_users WHERE id = ?").bind(id).first<UserRow>();
  return row ? rowToUser(row) : null;
}

export type CreateUserInput = {
  email: string;
  name?: string | null;
  role: Role;
  password: string;
};

export async function createUser(input: CreateUserInput) {
  const db = await requireD1();
  const email = input.email.trim().toLowerCase();
  const id = crypto.randomUUID();

  const existing = await db
    .prepare("SELECT id FROM admin_users WHERE email = ?")
    .bind(email)
    .first<{ id: string }>();

  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  await db
    .prepare(
      `INSERT INTO admin_users (id, email, name, role, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(id, email, input.name?.trim() || null, input.role, await hashPassword(input.password))
    .run();

  return id;
}

export async function updateUser(
  id: string,
  changes: { role?: Role; disabled?: boolean; name?: string | null; password?: string },
) {
  const db = await requireD1();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (changes.role) {
    fields.push("role = ?");
    values.push(changes.role);
  }

  if (changes.disabled !== undefined) {
    fields.push("disabled = ?");
    values.push(changes.disabled ? 1 : 0);
  }

  if (changes.name !== undefined) {
    fields.push("name = ?");
    values.push(changes.name?.trim() || null);
  }

  if (changes.password) {
    fields.push("password_hash = ?");
    values.push(await hashPassword(changes.password));
  }

  if (!fields.length) return;

  fields.push("updated_at = CURRENT_TIMESTAMP");

  await db
    .prepare(`UPDATE admin_users SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values, id)
    .run();

  // A disabled account or a changed password must not leave live sessions behind.
  if (changes.disabled || changes.password) {
    await revokeUserSessions(id);
  }
}

export async function deleteUser(id: string) {
  const db = await requireD1();
  await revokeUserSessions(id);
  await db.prepare("DELETE FROM admin_users WHERE id = ?").bind(id).run();
}

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "disabled" };

/**
 * Verifies an email and password.
 *
 * Returns the same `invalid` result for an unknown email and a wrong password,
 * and always runs a derivation, so neither the response nor its timing reveals
 * which addresses have accounts.
 */
export async function authenticate(email: string, password: string): Promise<AuthResult> {
  const db = await requireD1();

  const row = await db
    .prepare("SELECT * FROM admin_users WHERE email = ?")
    .bind(email.trim().toLowerCase())
    .first<UserRow>();

  if (!row) {
    await verifyPassword(password, DUMMY_HASH);
    return { ok: false, reason: "invalid" };
  }

  if (!(await verifyPassword(password, row.password_hash))) {
    return { ok: false, reason: "invalid" };
  }

  if (row.disabled) {
    return { ok: false, reason: "disabled" };
  }

  // The plaintext is in hand, so an outdated hash can be upgraded silently.
  if (needsRehash(row.password_hash)) {
    await db
      .prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?")
      .bind(await hashPassword(password), row.id)
      .run();
  }

  await db
    .prepare("UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(row.id)
    .run();

  return { ok: true, userId: row.id };
}

/* -------------------------------------------------------------------------- */
/* Sessions                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Issues an opaque session token.
 *
 * Only the SHA-256 of the token is stored, so a leaked database dump cannot be
 * replayed as a live session, and the row remains authoritative — signing out
 * or disabling an account takes effect immediately.
 */
export async function createSessionToken(userId: string, userAgent?: string | null) {
  const db = await requireD1();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await db
    .prepare(
      `INSERT INTO admin_sessions (id, token_hash, user_id, expires_at, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      await hashToken(token),
      userId,
      expiresAt.toISOString(),
      userAgent?.slice(0, 500) ?? null,
    )
    .run();

  return { token, expiresAt };
}

export type SessionUser = AdminUser & { sessionId: string };

export async function resolveSession(token: string): Promise<SessionUser | null> {
  const db = await getReadyD1();
  if (!db) return null;

  const row = await db
    .prepare(
      `SELECT s.id AS session_id, s.expires_at, u.*
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = ?
       LIMIT 1`,
    )
    .bind(await hashToken(token))
    .first<UserRow & { session_id: string; expires_at: string }>();

  if (!row) return null;
  if (row.disabled) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;

  return { ...rowToUser(row), sessionId: row.session_id };
}

export async function destroySessionToken(token: string) {
  const db = await getReadyD1();
  if (!db) return;
  await db
    .prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
    .bind(await hashToken(token))
    .run();
}

export async function revokeUserSessions(userId: string) {
  const db = await requireD1();
  await db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").bind(userId).run();
}
