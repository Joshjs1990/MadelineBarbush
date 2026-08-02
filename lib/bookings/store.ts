import {
  generateToken,
  hashPassword,
  hashToken,
  needsRehash,
  verifyPassword,
} from "@/lib/auth/password";
import type {
  Booking,
  BookingStatus,
  BookingWithClient,
  Client,
} from "@/lib/bookings/types";
import { getD1 } from "@/lib/d1";

/**
 * Clients, client sessions and bookings in D1.
 *
 * Client accounts are deliberately a separate table from `admin_users`: they are
 * a different trust level with a different login surface, and keeping them apart
 * means a bug in one cannot promote someone into the other.
 *
 * The schema is created on demand, matching the rest of the app, because this
 * hosting setup deploys without running Drizzle migrations against the remote
 * database.
 */

export const CLIENT_SESSION_DAYS = 30;

const DUMMY_HASH =
  "pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

type ClientRow = {
  id: string;
  email: string;
  name: string;
  company: string;
  phone: string;
  password_hash: string;
  disabled: number;
  last_login_at: string | null;
  created_at: string;
};

type BookingRow = {
  id: string;
  reference: string;
  client_id: string;
  title: string;
  starts_at: string;
  duration_minutes: number;
  location: string;
  notes: string;
  status: string;
  reminded_at: string | null;
  created_at: string;
  updated_at: string;
};

let schemaReady: Promise<void> | null = null;

async function initializeSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      disabled INTEGER NOT NULL DEFAULT 0,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS client_sessions (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      client_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      reference TEXT NOT NULL UNIQUE,
      client_id TEXT NOT NULL,
      title TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      location TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'requested',
      reminded_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS bookings_starts_idx ON bookings (starts_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS bookings_client_idx ON bookings (client_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS client_sessions_client_idx ON client_sessions (client_id)"),
  ]);
}

async function getReadyD1() {
  const db = await getD1();
  if (!db) return null;

  schemaReady ??= initializeSchema(db);

  try {
    await schemaReady;
  } catch (error) {
    schemaReady = null;
    throw error;
  }

  return db;
}

async function requireD1() {
  const db = await getReadyD1();
  if (!db) {
    throw new Error("D1 binding `DB` is required for bookings.");
  }
  return db;
}

export async function isBookingConfigured() {
  return (await getD1()) !== null;
}

function rowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    company: row.company,
    phone: row.phone,
    disabled: Boolean(row.disabled),
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };
}

function normalizeStatus(status: string): BookingStatus {
  return status === "confirmed" || status === "declined" || status === "cancelled"
    ? status
    : "requested";
}

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    reference: row.reference,
    clientId: row.client_id,
    title: row.title,
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    location: row.location,
    notes: row.notes,
    status: normalizeStatus(row.status),
    remindedAt: row.reminded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* -------------------------------------------------------------------------- */
/* Clients                                                                    */
/* -------------------------------------------------------------------------- */

export type RegisterInput = {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  password: string;
};

export async function registerClient(input: RegisterInput): Promise<Client> {
  const db = await requireD1();
  const email = input.email.trim().toLowerCase();

  const existing = await db
    .prepare("SELECT id FROM clients WHERE email = ?")
    .bind(email)
    .first<{ id: string }>();

  if (existing) {
    throw new Error("An account with that email already exists. Sign in instead.");
  }

  const id = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO clients (id, email, name, company, phone, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      email,
      input.name?.trim() ?? "",
      input.company?.trim() ?? "",
      input.phone?.trim() ?? "",
      await hashPassword(input.password),
    )
    .run();

  const client = await findClientById(id);
  if (!client) throw new Error("The account could not be read back after creation.");
  return client;
}

export type ClientAuthResult =
  | { ok: true; clientId: string }
  | { ok: false; reason: "invalid" | "disabled" };

/**
 * Verifies client credentials.
 *
 * Unknown email and wrong password return the same result and both run a
 * derivation, so neither the response nor its timing reveals which addresses
 * have accounts.
 */
export async function authenticateClient(
  email: string,
  password: string,
): Promise<ClientAuthResult> {
  const db = await requireD1();

  const row = await db
    .prepare("SELECT * FROM clients WHERE email = ?")
    .bind(email.trim().toLowerCase())
    .first<ClientRow>();

  if (!row) {
    await verifyPassword(password, DUMMY_HASH);
    return { ok: false, reason: "invalid" };
  }

  if (!(await verifyPassword(password, row.password_hash))) {
    return { ok: false, reason: "invalid" };
  }

  if (row.disabled) return { ok: false, reason: "disabled" };

  if (needsRehash(row.password_hash)) {
    await db
      .prepare("UPDATE clients SET password_hash = ? WHERE id = ?")
      .bind(await hashPassword(password), row.id)
      .run();
  }

  await db
    .prepare("UPDATE clients SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(row.id)
    .run();

  return { ok: true, clientId: row.id };
}

export async function findClientById(id: string) {
  const db = await requireD1();
  const row = await db.prepare("SELECT * FROM clients WHERE id = ?").bind(id).first<ClientRow>();
  return row ? rowToClient(row) : null;
}

export async function listClients(): Promise<Client[]> {
  const db = await requireD1();
  const result = await db
    .prepare("SELECT * FROM clients ORDER BY created_at DESC")
    .all<ClientRow>();
  return result.results.map(rowToClient);
}

export async function setClientDisabled(id: string, disabled: boolean) {
  const db = await requireD1();
  await db
    .prepare("UPDATE clients SET disabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(disabled ? 1 : 0, id)
    .run();

  // A disabled client with a live session would keep working until it expired.
  if (disabled) {
    await db.prepare("DELETE FROM client_sessions WHERE client_id = ?").bind(id).run();
  }
}

/* -------------------------------------------------------------------------- */
/* Client sessions                                                            */
/* -------------------------------------------------------------------------- */

export async function createClientSession(clientId: string, userAgent?: string | null) {
  const db = await requireD1();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + CLIENT_SESSION_DAYS * 86_400_000);

  await db
    .prepare(
      `INSERT INTO client_sessions (id, token_hash, client_id, expires_at, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      await hashToken(token),
      clientId,
      expiresAt.toISOString(),
      userAgent?.slice(0, 500) ?? null,
    )
    .run();

  return { token, expiresAt };
}

export async function resolveClientSession(token: string): Promise<Client | null> {
  const db = await getReadyD1();
  if (!db) return null;

  const row = await db
    .prepare(
      `SELECT s.expires_at, c.*
       FROM client_sessions s
       JOIN clients c ON c.id = s.client_id
       WHERE s.token_hash = ?
       LIMIT 1`,
    )
    .bind(await hashToken(token))
    .first<ClientRow & { expires_at: string }>();

  if (!row) return null;
  if (row.disabled) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;

  return rowToClient(row);
}

export async function destroyClientSession(token: string) {
  const db = await getReadyD1();
  if (!db) return;
  await db
    .prepare("DELETE FROM client_sessions WHERE token_hash = ?")
    .bind(await hashToken(token))
    .run();
}

/* -------------------------------------------------------------------------- */
/* Bookings                                                                   */
/* -------------------------------------------------------------------------- */

/** Short, unambiguous reference — no vowels, so it cannot spell anything. */
function makeReference() {
  const alphabet = "BCDFGHJKLMNPQRSTVWXZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `MB-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}

export type CreateBookingInput = {
  clientId: string;
  title: string;
  startsAt: string;
  durationMinutes?: number;
  location?: string;
  notes?: string;
  status?: BookingStatus;
};

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const db = await requireD1();

  const startsAt = new Date(input.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    throw new Error("That date and time could not be read.");
  }

  const id = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO bookings (id, reference, client_id, title, starts_at, duration_minutes, location, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      makeReference(),
      input.clientId,
      input.title.trim(),
      startsAt.toISOString(),
      input.durationMinutes ?? 60,
      input.location?.trim() ?? "",
      input.notes?.trim() ?? "",
      input.status ?? "requested",
    )
    .run();

  const booking = await findBookingById(id);
  if (!booking) throw new Error("The booking could not be read back after creation.");
  return booking;
}

export async function findBookingById(id: string) {
  const db = await requireD1();
  const row = await db.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first<BookingRow>();
  return row ? rowToBooking(row) : null;
}

export async function listBookingsForClient(clientId: string): Promise<Booking[]> {
  const db = await requireD1();
  const result = await db
    .prepare("SELECT * FROM bookings WHERE client_id = ? ORDER BY starts_at DESC")
    .bind(clientId)
    .all<BookingRow>();
  return result.results.map(rowToBooking);
}

/** Every booking with its client joined on, newest first, for the CRM. */
export async function listBookingsWithClients(): Promise<BookingWithClient[]> {
  const db = await requireD1();

  const result = await db
    .prepare(
      `SELECT b.*,
              c.id AS c_id, c.email AS c_email, c.name AS c_name, c.company AS c_company,
              c.phone AS c_phone, c.disabled AS c_disabled, c.last_login_at AS c_last_login_at,
              c.created_at AS c_created_at
       FROM bookings b
       LEFT JOIN clients c ON c.id = b.client_id
       ORDER BY b.starts_at ASC`,
    )
    .all<BookingRow & Record<string, string | number | null>>();

  return result.results.map((row) => ({
    ...rowToBooking(row),
    client: row.c_id
      ? rowToClient({
          id: String(row.c_id),
          email: String(row.c_email ?? ""),
          name: String(row.c_name ?? ""),
          company: String(row.c_company ?? ""),
          phone: String(row.c_phone ?? ""),
          password_hash: "",
          disabled: Number(row.c_disabled ?? 0),
          last_login_at: row.c_last_login_at ? String(row.c_last_login_at) : null,
          created_at: String(row.c_created_at ?? ""),
        })
      : null,
  }));
}

export async function setBookingStatus(id: string, status: BookingStatus) {
  const db = await requireD1();
  await db
    .prepare("UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(status, id)
    .run();
  return findBookingById(id);
}

export async function updateBooking(
  id: string,
  changes: {
    title?: string;
    startsAt?: string;
    durationMinutes?: number;
    location?: string;
    notes?: string;
  },
) {
  const db = await requireD1();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (changes.title !== undefined) {
    fields.push("title = ?");
    values.push(changes.title.trim());
  }

  if (changes.startsAt !== undefined) {
    const startsAt = new Date(changes.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      throw new Error("That date and time could not be read.");
    }
    fields.push("starts_at = ?");
    values.push(startsAt.toISOString());
    // A moved booking has not been reminded about at its new time.
    fields.push("reminded_at = NULL");
  }

  if (changes.durationMinutes !== undefined) {
    fields.push("duration_minutes = ?");
    values.push(changes.durationMinutes);
  }

  if (changes.location !== undefined) {
    fields.push("location = ?");
    values.push(changes.location.trim());
  }

  if (changes.notes !== undefined) {
    fields.push("notes = ?");
    values.push(changes.notes.trim());
  }

  if (!fields.length) return findBookingById(id);

  fields.push("updated_at = CURRENT_TIMESTAMP");

  await db
    .prepare(`UPDATE bookings SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values, id)
    .run();

  return findBookingById(id);
}

export async function deleteBooking(id: string) {
  const db = await requireD1();
  await db.prepare("DELETE FROM bookings WHERE id = ?").bind(id).run();
}

/**
 * Confirmed bookings starting inside the window that have not been reminded yet.
 *
 * `reminded_at` is the idempotency guard: the cron endpoint can be called every
 * hour, or twice by accident, without anyone getting two reminders.
 */
export async function listBookingsNeedingReminder(
  windowStart: Date,
  windowEnd: Date,
): Promise<BookingWithClient[]> {
  const db = await requireD1();

  const result = await db
    .prepare(
      `SELECT b.*,
              c.id AS c_id, c.email AS c_email, c.name AS c_name, c.company AS c_company,
              c.phone AS c_phone, c.disabled AS c_disabled, c.last_login_at AS c_last_login_at,
              c.created_at AS c_created_at
       FROM bookings b
       LEFT JOIN clients c ON c.id = b.client_id
       WHERE b.status = 'confirmed'
         AND b.reminded_at IS NULL
         AND b.starts_at >= ?
         AND b.starts_at < ?
       ORDER BY b.starts_at ASC`,
    )
    .bind(windowStart.toISOString(), windowEnd.toISOString())
    .all<BookingRow & Record<string, string | number | null>>();

  return result.results.map((row) => ({
    ...rowToBooking(row),
    client: row.c_id
      ? rowToClient({
          id: String(row.c_id),
          email: String(row.c_email ?? ""),
          name: String(row.c_name ?? ""),
          company: String(row.c_company ?? ""),
          phone: String(row.c_phone ?? ""),
          password_hash: "",
          disabled: Number(row.c_disabled ?? 0),
          last_login_at: row.c_last_login_at ? String(row.c_last_login_at) : null,
          created_at: String(row.c_created_at ?? ""),
        })
      : null,
  }));
}

export async function markReminded(id: string) {
  const db = await requireD1();
  await db
    .prepare("UPDATE bookings SET reminded_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();
}
