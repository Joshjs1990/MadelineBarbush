import { getD1 } from "@/lib/d1";
import {
  normalizeShowreel,
  SHOWREEL_DEFAULTS,
  type Showreel,
} from "@/lib/site-settings/showreel";

/**
 * Small key/value store in D1 for editable site chrome that is not a case study.
 *
 * Values are JSON blobs keyed by name, so a new editable block does not need a
 * schema change — only a default and a shape in `showreel.ts` alongside.
 */

const SHOWREEL_KEY = "showreel";

let schemaReady: Promise<void> | null = null;

async function initializeSchema(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    )
    .run();
}

async function getReadyD1() {
  const db = await getD1();

  if (!db) {
    return null;
  }

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

async function readSetting(key: string) {
  const db = await getReadyD1();
  if (!db) return null;

  const row = await db
    .prepare("SELECT value FROM site_settings WHERE key = ?")
    .bind(key)
    .first<{ value: string }>();

  return row?.value ?? null;
}

async function writeSetting(key: string, value: string) {
  const db = await getReadyD1();

  if (!db) {
    throw new Error("D1 binding `DB` is required to save site settings.");
  }

  await db
    .prepare(
      `INSERT INTO site_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(key, value)
    .run();
}

/** Never throws — the homepage falls back to the defaults without a database. */
export async function getShowreel(): Promise<Showreel> {
  try {
    const stored = await readSetting(SHOWREEL_KEY);
    if (!stored) return SHOWREEL_DEFAULTS;
    return normalizeShowreel(JSON.parse(stored) as Partial<Showreel>);
  } catch (error) {
    console.error("Falling back to the default showreel", error);
    return SHOWREEL_DEFAULTS;
  }
}

export async function saveShowreel(input: Partial<Showreel>) {
  const showreel = normalizeShowreel(input);
  await writeSetting(SHOWREEL_KEY, JSON.stringify(showreel));
  return showreel;
}
