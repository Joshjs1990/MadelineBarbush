import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const caseStudies = sqliteTable("case_studies", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  year: text("year").notNull(),
  type: text("type").notNull(),
  role: text("role").notNull(),
  director: text("director"),
  productionCompany: text("production_company"),
  intro: text("intro").notNull(),
  description: text("description").notNull(),
  archiveNote: text("archive_note").notNull(),
  longDescription: text("long_description").notNull(),
  performanceNotes: text("performance_notes").notNull(),
  atmosphere: text("atmosphere").notNull(),
  heroImage: text("hero_image").notNull(),
  gallery: text("gallery").notNull(),
  videoEmbeds: text("video_embeds").notNull().default("[]"),
  credits: text("credits").notNull(),
  pullQuote: text("pull_quote").notNull(),
  accentColor: text("accent_color").notNull(),
  textColor: text("text_color").notNull(),
  relatedProjectSlug: text("related_project_slug").notNull(),
  externalLink: text("external_link"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  order: integer("order_index").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role", { enum: ["admin", "editor"] })
    .notNull()
    .default("editor"),
  passwordHash: text("password_hash").notNull(),
  disabled: integer("disabled", { mode: "boolean" }).notNull().default(false),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  company: text("company").notNull().default(""),
  phone: text("phone").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  disabled: integer("disabled", { mode: "boolean" }).notNull().default(false),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const clientSessions = sqliteTable("client_sessions", {
  id: text("id").primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  clientId: text("client_id").notNull(),
  expiresAt: text("expires_at").notNull(),
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  // Short human-quotable code, for referring to a booking over email or phone.
  reference: text("reference").notNull().unique(),
  clientId: text("client_id").notNull(),
  title: text("title").notNull(),
  // ISO-8601 UTC. Stored as text so ordering and range queries stay lexical.
  startsAt: text("starts_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  location: text("location").notNull().default(""),
  notes: text("notes").notNull().default(""),
  status: text("status", { enum: ["requested", "confirmed", "declined", "cancelled"] })
    .notNull()
    .default("requested"),
  // Set when the day-before reminder goes out, so a repeated cron run is a no-op.
  remindedAt: text("reminded_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminSessions = sqliteTable("admin_sessions", {
  id: text("id").primaryKey(),
  // Only the SHA-256 of the session token is stored, never the token itself.
  tokenHash: text("token_hash").notNull().unique(),
  userId: text("user_id").notNull(),
  expiresAt: text("expires_at").notNull(),
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
