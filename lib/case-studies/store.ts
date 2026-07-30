import { projects as seedProjects } from "@/data/projects";
import type { Project, ProjectCredit, ProjectGalleryImage, ProjectVideoEmbed } from "@/types/project";

type D1Env = {
  DB?: D1Database;
};

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
  order_index: number;
};

export type CaseStudyInput = Omit<Project, "order"> & {
  order?: number;
};

let schemaReady: Promise<void> | null = null;

async function getD1() {
  try {
    const runtime = (await import("cloudflare:workers")) as { env?: D1Env };
    return runtime.env?.DB ?? null;
  } catch {
    return null;
  }
}

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

function normalizeInput(input: CaseStudyInput): Project {
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
      order_index INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS case_studies_slug_idx ON case_studies (slug)"),
    db.prepare("CREATE INDEX IF NOT EXISTS case_studies_order_idx ON case_studies (order_index)"),
  ]);
}

async function getReadyD1() {
  const db = await getD1();

  if (!db) {
    return null;
  }

  schemaReady ??= initializeSchema(db);
  await schemaReady;
  return db;
}

export async function listCaseStudies(): Promise<Project[]> {
  try {
    const db = await getReadyD1();

    if (!db) {
      return seedProjects;
    }

    const result = await db
      .prepare("SELECT * FROM case_studies ORDER BY order_index ASC, created_at DESC")
      .all<CaseStudyRow>();

    if (!result.results.length) {
      return seedProjects;
    }

    return result.results.map(rowToProject);
  } catch (error) {
    console.error("Falling back to seed case studies", error);
    return seedProjects;
  }
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
        return rowToProject(row);
      }
    }
  } catch (error) {
    console.error("Falling back to seed case study", error);
  }

  return seedProjects.find((project) => project.slug === slug);
}

export async function createCaseStudy(input: CaseStudyInput) {
  const db = await getReadyD1();

  if (!db) {
    throw new Error("D1 binding `DB` is required to save case studies.");
  }

  const project = normalizeInput(input);
  const id = crypto.randomUUID();

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
      order_index,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
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
      project.order,
    )
    .run();

  return project;
}

export function getRelatedProjectFromList(project: Project, list: Project[]) {
  return list.find((candidate) => candidate.slug === project.relatedProjectSlug) ?? list[0] ?? project;
}
