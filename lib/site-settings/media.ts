import { readSetting, writeSetting } from "@/lib/site-settings/store";

export type MediaPlacement = "showreel" | "showreel-image" | "gallery" | "performance-stills" | "videos-page" | "work-page";
export type ExternalMedia = { id: string; title: string; url: string; contentType: "youtube"; placements: MediaPlacement[] };
export type MediaPlacements = Record<string, MediaPlacement[]>;
export type MediaMetadata = Record<string, string>;
export type SiteImage = { src: string; alt: string; focalX: number; focalY: number; fit: "cover" | "contain" };
export type VisualMedia = { homeHero: SiteImage; bio: SiteImage; resumePrimary: SiteImage; resumeSecondary: SiteImage; recentPrimary: SiteImage; recentSecondary: SiteImage; contact: SiteImage };
export const VISUAL_MEDIA_DEFAULTS: VisualMedia = {
  homeHero: { src: "/images/actor-wide.jpg", alt: "Wide editorial portrait of the actor seated in a domestic bathroom interior.", focalX: 50, focalY: 50, fit: "cover" },
  bio: { src: "/images/maddie-bio.webp", alt: "Madeline Barbush", focalX: 50, focalY: 15, fit: "contain" },
  resumePrimary: { src: "/images/actor-close.jpg", alt: "Madeline Barbush", focalX: 50, focalY: 15, fit: "contain" },
  resumeSecondary: { src: "/images/maddie-resume.webp", alt: "Madeline Barbush", focalX: 50, focalY: 15, fit: "contain" },
  recentPrimary: { src: "/images/work/motel-blue-hour.webp", alt: "Recent highlight placeholder", focalX: 50, focalY: 50, fit: "cover" },
  recentSecondary: { src: "/images/work/white-noise-rehearsal.webp", alt: "Recent highlight placeholder", focalX: 50, focalY: 50, fit: "cover" },
  contact: { src: "/images/actor-close.jpg", alt: "Madeline Barbush", focalX: 50, focalY: 15, fit: "contain" },
};

function normalizeImage(input: unknown, fallback: SiteImage): SiteImage {
  const source = input && typeof input === "object" ? input as Partial<SiteImage> : {};
  return { src: typeof source.src === "string" && source.src.trim() ? source.src.trim() : fallback.src, alt: typeof source.alt === "string" ? source.alt.trim().slice(0, 180) : fallback.alt, focalX: Number.isFinite(source.focalX) ? Math.max(0, Math.min(100, Number(source.focalX))) : fallback.focalX, focalY: Number.isFinite(source.focalY) ? Math.max(0, Math.min(100, Number(source.focalY))) : fallback.focalY, fit: source.fit === "contain" ? "contain" : "cover" };
}

export function normalizeVisualMedia(input: unknown): VisualMedia {
  const source = input && typeof input === "object" ? input as Partial<VisualMedia> : {};
  return Object.fromEntries(Object.entries(VISUAL_MEDIA_DEFAULTS).map(([key, fallback]) => [key, normalizeImage(source[key as keyof VisualMedia], fallback)])) as VisualMedia;
}

const VISUAL_MEDIA_KEY = "visual-media";

export async function getVisualMedia(): Promise<VisualMedia> {
  try { const stored = await readSetting(VISUAL_MEDIA_KEY); return normalizeVisualMedia(stored ? JSON.parse(stored) : null); } catch { return VISUAL_MEDIA_DEFAULTS; }
}

export async function saveVisualMedia(input: unknown) {
  const media = normalizeVisualMedia(input);
  await writeSetting(VISUAL_MEDIA_KEY, JSON.stringify(media));
  return media;
}

const MEDIA_KEY = "external-media";
const PLACEMENTS_KEY = "media-placements";
const ORDER_KEY = "media-order";
const METADATA_KEY = "media-metadata";
const VALID_PLACEMENTS: MediaPlacement[] = ["showreel", "showreel-image", "gallery", "performance-stills", "videos-page", "work-page"];

function normalizePlacements(input: unknown): MediaPlacement[] {
  return Array.isArray(input) ? input.filter((item): item is MediaPlacement => typeof item === "string" && VALID_PLACEMENTS.includes(item as MediaPlacement)) : [];
}

export async function getExternalMedia(): Promise<ExternalMedia[]> {
  try {
    const stored = await readSetting(MEDIA_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ExternalMedia => Boolean(item && typeof item === "object" && typeof (item as ExternalMedia).id === "string" && typeof (item as ExternalMedia).url === "string" && typeof (item as ExternalMedia).title === "string")).map((item) => ({ ...item, placements: normalizePlacements(item.placements) }));
  } catch {
    return [];
  }
}

export async function saveExternalMedia(items: ExternalMedia[]) {
  await writeSetting(MEDIA_KEY, JSON.stringify(items));
  return items;
}

export async function getMediaPlacements(): Promise<MediaPlacements> {
  try {
    const stored = await readSetting(PLACEMENTS_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, normalizePlacements(value)]));
  } catch {
    return {};
  }
}

export async function saveMediaPlacements(input: MediaPlacements) {
  await writeSetting(PLACEMENTS_KEY, JSON.stringify(input));
  return input;
}

export async function getMediaOrder(): Promise<string[]> {
  try {
    const stored = await readSetting(ORDER_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function saveMediaOrder(input: string[]) {
  const order = [...new Set(input.filter((item) => typeof item === "string" && item.length > 0))];
  await writeSetting(ORDER_KEY, JSON.stringify(order));
  return order;
}

export async function getMediaMetadata(): Promise<MediaMetadata> {
  try {
    const stored = await readSetting(METADATA_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === "string" && value.trim()).map(([key, value]) => [key, (value as string).trim()]));
  } catch {
    return {};
  }
}

export async function saveMediaMetadata(input: MediaMetadata) {
  const metadata = Object.fromEntries(Object.entries(input).filter(([key, value]) => key && typeof value === "string" && value.trim()).map(([key, value]) => [key, value.trim()]));
  await writeSetting(METADATA_KEY, JSON.stringify(metadata));
  return metadata;
}
