import { readSetting, writeSetting } from "@/lib/site-settings/store";

export type MediaPlacement = "showreel" | "showreel-image" | "gallery" | "performance-stills" | "videos-page" | "work-page";
export type ExternalMedia = { id: string; title: string; url: string; contentType: "youtube"; placements: MediaPlacement[] };
export type MediaPlacements = Record<string, MediaPlacement[]>;
export type MediaMetadata = Record<string, string>;

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
