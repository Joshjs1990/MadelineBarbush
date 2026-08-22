import { readSetting, writeSetting } from "@/lib/site-settings/store";

export type MediaPlacement = "showreel" | "showreel-image" | "gallery" | "videos-page" | "work-page";
export type ExternalMedia = { id: string; title: string; url: string; contentType: "youtube"; placements: MediaPlacement[] };
export type MediaPlacements = Record<string, MediaPlacement[]>;

const MEDIA_KEY = "external-media";
const PLACEMENTS_KEY = "media-placements";
const VALID_PLACEMENTS: MediaPlacement[] = ["showreel", "showreel-image", "gallery", "videos-page", "work-page"];

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
