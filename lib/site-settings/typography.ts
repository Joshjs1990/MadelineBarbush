import { readSetting, writeSetting } from "@/lib/site-settings/store";
import { normalizeTextSizing, type TextSizing } from "@/lib/site-settings/typography-shared";

export type { TextSize, TextSizing } from "@/lib/site-settings/typography-shared";

const TEXT_SIZING_KEY = "text-sizing";

export async function getTextSizing(): Promise<TextSizing> {
  try {
    const stored = await readSetting(TEXT_SIZING_KEY);
    return normalizeTextSizing(stored ? JSON.parse(stored) : null);
  } catch (error) {
    console.error("Falling back to the default text sizing", error);
    return normalizeTextSizing(null);
  }
}

export async function saveTextSizing(input: unknown) {
  const sizing = normalizeTextSizing(input);
  await writeSetting(TEXT_SIZING_KEY, JSON.stringify(sizing));
  return sizing;
}
