import { getD1 } from "@/lib/d1";
import { readSetting, writeSetting } from "@/lib/site-settings/store";
import { EDITABLE_FIELDS, fieldValue, normalizeContent, setFieldValue, type EditableContent, type EditableFieldId } from "@/lib/assistant/registry";
import type { SessionUser } from "@/lib/auth/store";

const CONTENT_KEY = "assistant-editable-content";
let schemaReady: Promise<void> | null = null;

export type AssistantRevision = {
  id: string;
  userId: string;
  userEmail: string;
  fieldId: EditableFieldId;
  action: "update" | "undo" | "replace";
  previousValue: string;
  newValue: string;
  summary: string;
  createdAt: string;
};

async function initializeSchema(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS assistant_revisions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    field_id TEXT NOT NULL,
    action TEXT NOT NULL,
    previous_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await db.prepare("CREATE INDEX IF NOT EXISTS assistant_revisions_created_idx ON assistant_revisions (created_at DESC)").run();
}

async function readyDb() {
  const db = await getD1();
  if (!db) return null;
  schemaReady ??= initializeSchema(db);
  try { await schemaReady; } catch (error) { schemaReady = null; throw error; }
  return db;
}

export async function getEditableContent(): Promise<EditableContent> {
  try { const stored = await readSetting(CONTENT_KEY); return normalizeContent(stored ? JSON.parse(stored) : null); } catch { return normalizeContent(null); }
}

export async function getRevisionHistory(limit = 30): Promise<AssistantRevision[]> {
  const db = await readyDb();
  if (!db) return [];
  const result = await db.prepare("SELECT id, user_id, user_email, field_id, action, previous_value, new_value, summary, created_at FROM assistant_revisions ORDER BY created_at DESC LIMIT ?").bind(Math.min(Math.max(limit, 1), 100)).all<{ id: string; user_id: string; user_email: string; field_id: string; action: AssistantRevision["action"]; previous_value: string; new_value: string; summary: string; created_at: string }>();
  return result.results.map((row) => ({ id: row.id, userId: row.user_id, userEmail: row.user_email, fieldId: row.field_id as EditableFieldId, action: row.action, previousValue: row.previous_value, newValue: row.new_value, summary: row.summary, createdAt: row.created_at }));
}

export function validateField(fieldId: string, value: string) {
  const field = EDITABLE_FIELDS[fieldId as EditableFieldId];
  if (!field) throw new Error("That field is not available for self-service editing.");
  const normalized = value.trim();
  if (!normalized || normalized.length > field.maxLength) throw new Error(`${field.label} must be between 1 and ${field.maxLength} characters.`);
  if (field.type === "color" && !/^#[0-9a-f]{6}$/i.test(normalized)) throw new Error("Colours must be six-digit hex values such as #14532d.");
  if (field.type === "font" && !["Archivo", "Oswald", "Arial", "Georgia"].includes(normalized)) throw new Error("That font is not on the approved font list.");
  if (/</.test(normalized)) throw new Error("HTML and markup are not allowed in editable text.");
  return normalized;
}

export type ProposedChange = { fieldId: EditableFieldId; value: string; expectedValue?: string; summary: string; action?: "update" | "replace" | "undo" };

export async function applyChanges(user: SessionUser, changes: ProposedChange[]) {
  if (!changes.length || changes.length > 20) throw new Error("The change set is empty or too large.");
  const content = await getEditableContent();
  const next = normalizeContent(content);
  const prepared = changes.map((change) => {
    const previousValue = fieldValue(content, change.fieldId);
    if (change.expectedValue !== undefined && previousValue !== change.expectedValue) throw new Error(`The current value for ${EDITABLE_FIELDS[change.fieldId].label} changed. Please ask again so I can refresh the proposal.`);
    const value = validateField(change.fieldId, change.value);
    return { ...change, value, previousValue };
  });
  for (const change of prepared) Object.assign(next, setFieldValue(next, change.fieldId, change.value));
  await writeSetting(CONTENT_KEY, JSON.stringify(next));
  const db = await readyDb();
  if (!db) throw new Error("D1 is required to save assistant changes and history.");
  const statements = prepared.map((change) => db.prepare("INSERT INTO assistant_revisions (id, user_id, user_email, field_id, action, previous_value, new_value, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), user.id, user.email, change.fieldId, change.action ?? "update", change.previousValue, change.value, change.summary.slice(0, 240)));
  await db.batch(statements);
  return { content: next, changes: prepared };
}

export async function undoRevision(user: SessionUser, revisionId: string) {
  const db = await readyDb();
  if (!db) throw new Error("D1 is required to undo assistant changes.");
  const row = await db.prepare("SELECT * FROM assistant_revisions WHERE id = ?").bind(revisionId).first<{ id: string; user_id: string; field_id: string; previous_value: string; new_value: string; summary: string }>();
  if (!row) throw new Error("That change could not be found.");
  const content = await getEditableContent();
  if (fieldValue(content, row.field_id as EditableFieldId) !== row.new_value) throw new Error("This change cannot be undone safely because the field has changed since then.");
  return applyChanges(user, [{ fieldId: row.field_id as EditableFieldId, value: row.previous_value, expectedValue: row.new_value, action: "undo", summary: `Undid: ${row.summary}` }]);
}
