import { readSetting, writeSetting } from "@/lib/site-settings/store";
import { normalizeGlobalTypography, normalizeTextSizing, type GlobalTypography, type TextSizing } from "@/lib/site-settings/typography-shared";

export type { TextSize, TextSizing } from "@/lib/site-settings/typography-shared";
export type { GlobalTypography } from "@/lib/site-settings/typography-shared";

const TEXT_SIZING_KEY = "text-sizing";
const GLOBAL_TYPOGRAPHY_KEY = "global-typography";

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

export async function getGlobalTypography(): Promise<GlobalTypography> {
  try {
    const stored = await readSetting(GLOBAL_TYPOGRAPHY_KEY);
    return normalizeGlobalTypography(stored ? JSON.parse(stored) : null);
  } catch (error) {
    console.error("Falling back to the default global typography", error);
    return normalizeGlobalTypography(null);
  }
}

export async function saveGlobalTypography(input: unknown) {
  const typography = normalizeGlobalTypography(input);
  await writeSetting(GLOBAL_TYPOGRAPHY_KEY, JSON.stringify(typography));
  return typography;
}
