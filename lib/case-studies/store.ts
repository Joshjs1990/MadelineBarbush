import { projects as seedProjects } from "@/data/projects";
import { mergeCaseStudyLists } from "@/lib/case-studies/merge";
import { getD1 } from "@/lib/d1";
import type { Project, ProjectCredit, ProjectGalleryImage, ProjectVideoEmbed } from "@/types/project";

type CaseStudyRow = {
  id: string;
  title: string;
  slug: string;
  year: string;
  type: string;
  role: string;
  director: string | null;
  production_company: string | null;
  intro: string;
  description: string;
  archive_note: string;
  long_description: string;
  performance_notes: string;
  atmosphere: string;
  hero_image: string;
  gallery: string;
  video_embeds: string;
  credits: string;
  pull_quote: string;
  accent_color: string;
  text_color: string;
  related_project_slug: string;
  external_link: string | null;
  featured: number;
  hidden: number;
  order_index: number;
};

export type CaseStudyInput = Omit<Project, "order"> & {
  order?: number;
  hidden?: boolean;
};

/**
 * An entry as the admin sees it: the resolved content plus where it came from.
 *
 * `stored` means a row exists in D1 and the entry can be deleted; `seeded`
 * means the slug also ships in `data/projects.ts`, so deleting the row reverts
 * to that built-in version rather than removing the case study.
 */
export type AdminCaseStudy = {
  project: Project;
  hidden: boolean;
  stored: boolean;
  seeded: boolean;
};

let schemaReady: Promise<void> | null = null;

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToProject(row: CaseStudyRow): Project {
  return {
    title: row.title,
    slug: row.slug,
    year: row.year,
    type: row.type,
    role: row.role,
    director: row.director ?? undefined,
    productionCompany: row.production_company ?? undefined,
    intro: row.intro,
    description: row.description,
    archiveNote: row.archive_note,
    longDescription: parseJson<string[]>(row.long_description, []),
    performanceNotes: parseJson<string[]>(row.performance_notes, []),
    atmosphere: row.atmosphere,
    heroImage: row.hero_image,
    gallery: parseJson<ProjectGalleryImage[]>(row.gallery, []),
    videoEmbeds: parseJson<ProjectVideoEmbed[]>(row.video_embeds, []),
    credits: parseJson<ProjectCredit[]>(row.credits, []),
    pullQuote: row.pull_quote,
    accentColor: row.accent_color,
    textColor: row.text_color,
    relatedProjectSlug: row.related_project_slug,
    externalLink: row.external_link ?? undefined,
    featured: Boolean(row.featured),
    order: row.order_index,
  };
}

function normalizeInput(input: CaseStudyInput): Project & { hidden: boolean } {
  const order = input.order ?? Date.now();

  return {
    ...input,
    slug: input.slug.trim(),
    title: input.title.trim(),
    year: input.year.trim(),
    type: input.type.trim(),
    role: input.role.trim(),
    director: input.director?.trim() || undefined,
    productionCompany: input.productionCompany?.trim() || undefined,
    intro: input.intro.trim(),
    description: input.description.trim(),
    archiveNote: input.archiveNote.trim(),
    longDescription: input.longDescription.filter(Boolean),
    performanceNotes: input.performanceNotes.filter(Boolean),
    atmosphere: input.atmosphere.trim(),
    heroImage: input.heroImage.trim(),
    gallery: input.gallery.filter((image) => image.src.trim()),
    videoEmbeds: input.videoEmbeds?.filter((embed) => embed.url.trim()) ?? [],
    credits: input.credits.filter((credit) => credit.label.trim() && credit.value.trim()),
    pullQuote: input.pullQuote.trim(),
    accentColor: input.accentColor.trim(),
    textColor: input.textColor.trim(),
    relatedProjectSlug: input.relatedProjectSlug.trim(),
    externalLink: input.externalLink?.trim() || undefined,
    featured: Boolean(input.featured),
    hidden: Boolean(input.hidden),
    order,
  };
}

async function initializeSchema(db: D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS case_studies (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      year TEXT NOT NULL,
      type TEXT NOT NULL,
      role TEXT NOT NULL,
      director TEXT,
      production_company TEXT,
      intro TEXT NOT NULL,
      description TEXT NOT NULL,
      archive_note TEXT NOT NULL,
      long_description TEXT NOT NULL,
      performance_notes TEXT NOT NULL,
      atmosphere TEXT NOT NULL,
      hero_image TEXT NOT NULL,
      gallery TEXT NOT NULL,
      video_embeds TEXT NOT NULL DEFAULT '[]',
      credits TEXT NOT NULL,
      pull_quote TEXT NOT NULL,
      accent_color TEXT NOT NULL,
      text_color TEXT NOT NULL,
      related_project_slug TEXT NOT NULL,
      external_link TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      hidden INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS case_studies_slug_idx ON case_studies (slug)"),
    db.prepare("CREATE INDEX IF NOT EXISTS case_studies_order_idx ON case_studies (order_index)"),
  ]);

  // `hidden` was added after the first deploy, so databases created from the
  // original schema need it applied separately. SQLite has no
  // `ADD COLUMN IF NOT EXISTS`; a duplicate-column error just means it is there.
  try {
    await db.prepare("ALTER TABLE case_studies ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0").run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/duplicate column/i.test(message)) throw error;
  }
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

async function readRows(db: D1Database): Promise<CaseStudyRow[]> {
  const result = await db
    .prepare("SELECT * FROM case_studies ORDER BY order_index ASC, created_at DESC")
    .all<CaseStudyRow>();
  return result.results;
}

/** The public list: seed content overridden by D1, with hidden entries removed. */
export async function listCaseStudies(): Promise<Project[]> {
  try {
    const db = await getReadyD1();

    if (!db) {
      return seedProjects;
    }

    const rows = await readRows(db);
    const hiddenSlugs = new Set(rows.filter((row) => row.hidden).map((row) => row.slug));

    return mergeCaseStudyLists(seedProjects, rows.map(rowToProject)).filter(
      (project) => !hiddenSlugs.has(project.slug),
    );
  } catch (error) {
    console.error("Falling back to seed case studies", error);
    return seedProjects;
  }
}

/** The admin list: everything, including hidden entries, with their origin. */
export async function listCaseStudiesForAdmin(): Promise<AdminCaseStudy[]> {
  const db = await getReadyD1();
  const seedSlugs = new Set(seedProjects.map((project) => project.slug));

  const entries = new Map<string, AdminCaseStudy>(
    seedProjects.map((project) => [
      project.slug,
      { project, hidden: false, stored: false, seeded: true },
    ]),
  );

  if (db) {
    for (const row of await readRows(db)) {
      entries.set(row.slug, {
        project: rowToProject(row),
        hidden: Boolean(row.hidden),
        stored: true,
        seeded: seedSlugs.has(row.slug),
      });
    }
  }

  return Array.from(entries.values()).sort((a, b) => a.project.order - b.project.order);
}

export async function findCaseStudy(slug: string) {
  try {
    const db = await getReadyD1();

    if (db) {
      const row = await db
        .prepare("SELECT * FROM case_studies WHERE slug = ? LIMIT 1")
        .bind(slug)
        .first<CaseStudyRow>();

      if (row) {
        // A hidden override must not fall through to the seed version.
        return row.hidden ? undefined : rowToProject(row);
      }
    }
  } catch (error) {
    console.error("Falling back to seed case study", error);
  }

  return seedProjects.find((project) => project.slug === slug);
}

/** The editor's read path — hidden entries are still editable. */
export async function findCaseStudyForAdmin(slug: string): Promise<AdminCaseStudy | null> {
  const db = await getReadyD1();

  if (db) {
    const row = await db
      .prepare("SELECT * FROM case_studies WHERE slug = ? LIMIT 1")
      .bind(slug)
      .first<CaseStudyRow>();

    if (row) {
      return {
        project: rowToProject(row),
        hidden: Boolean(row.hidden),
        stored: true,
        seeded: seedProjects.some((project) => project.slug === slug),
      };
    }
  }

  const seed = seedProjects.find((project) => project.slug === slug);
  return seed ? { project: seed, hidden: false, stored: false, seeded: true } : null;
}

/**
 * Writes a case study, replacing any existing entry with the same slug.
 *
 * Editing a seed case study creates the D1 row that overrides it, so one path
 * serves both "create new" and "edit built-in".
 */
export async function saveCaseStudy(input: CaseStudyInput) {
  const db = await getReadyD1();

  if (!db) {
    throw new Error("D1 binding `DB` is required to save case studies.");
  }

  const project = normalizeInput(input);

  const existing = await db
    .prepare("SELECT id FROM case_studies WHERE slug = ?")
    .bind(project.slug)
    .first<{ id: string }>();

  const id = existing?.id ?? crypto.randomUUID();

  await db
    .prepare(`INSERT INTO case_studies (
      id,
      title,
      slug,
      year,
      type,
      role,
      director,
      production_company,
      intro,
      description,
      archive_note,
      long_description,
      performance_notes,
      atmosphere,
      hero_image,
      gallery,
      video_embeds,
      credits,
      pull_quote,
      accent_color,
      text_color,
      related_project_slug,
      external_link,
      featured,
      hidden,
      order_index,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      year = excluded.year,
      type = excluded.type,
      role = excluded.role,
      director = excluded.director,
      production_company = excluded.production_company,
      intro = excluded.intro,
      description = excluded.description,
      archive_note = excluded.archive_note,
      long_description = excluded.long_description,
      performance_notes = excluded.performance_notes,
      atmosphere = excluded.atmosphere,
      hero_image = excluded.hero_image,
      gallery = excluded.gallery,
      video_embeds = excluded.video_embeds,
      credits = excluded.credits,
      pull_quote = excluded.pull_quote,
      accent_color = excluded.accent_color,
      text_color = excluded.text_color,
      related_project_slug = excluded.related_project_slug,
      external_link = excluded.external_link,
      featured = excluded.featured,
      hidden = excluded.hidden,
      order_index = excluded.order_index,
      updated_at = CURRENT_TIMESTAMP`)
    .bind(
      id,
      project.title,
      project.slug,
      project.year,
      project.type,
      project.role,
      project.director ?? null,
      project.productionCompany ?? null,
      project.intro,
      project.description,
      project.archiveNote,
      JSON.stringify(project.longDescription),
      JSON.stringify(project.performanceNotes),
      project.atmosphere,
      project.heroImage,
      JSON.stringify(project.gallery),
      JSON.stringify(project.videoEmbeds ?? []),
      JSON.stringify(project.credits),
      project.pullQuote,
      project.accentColor,
      project.textColor,
      project.relatedProjectSlug,
      project.externalLink ?? null,
      project.featured ? 1 : 0,
      project.hidden ? 1 : 0,
      project.order,
    )
    .run();

  return project;
}

/** Kept as an alias for the original create-only API surface. */
export const createCaseStudy = saveCaseStudy;

/**
 * Sets the visibility of a case study.
 *
 * Hiding a seed case study has to write a full override row, because there is
 * nothing in D1 to flag until one exists.
 */
export async function setCaseStudyHidden(slug: string, hidden: boolean) {
  const db = await getReadyD1();

  if (!db) {
    throw new Error("D1 binding `DB` is required to change visibility.");
  }

  const existing = await db
    .prepare("SELECT id FROM case_studies WHERE slug = ?")
    .bind(slug)
    .first<{ id: string }>();

  if (existing) {
    await db
      .prepare("UPDATE case_studies SET hidden = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?")
      .bind(hidden ? 1 : 0, slug)
      .run();
    return;
  }

  const seed = seedProjects.find((project) => project.slug === slug);

  if (!seed) {
    throw new Error("That case study no longer exists.");
  }

  await saveCaseStudy({ ...seed, hidden });
}

/**
 * Removes the stored row.
 *
 * When the slug also ships as seed content, this reverts the case study to its
 * built-in version rather than removing it from the site.
 */
export async function deleteCaseStudy(slug: string) {
  const db = await getReadyD1();

  if (!db) {
    throw new Error("D1 binding `DB` is required to delete case studies.");
  }

  await db.prepare("DELETE FROM case_studies WHERE slug = ?").bind(slug).run();

  return { revertedToSeed: seedProjects.some((project) => project.slug === slug) };
}

export function getRelatedProjectFromList(project: Project, list: Project[]) {
  return list.find((candidate) => candidate.slug === project.relatedProjectSlug) ?? list[0] ?? project;
}
