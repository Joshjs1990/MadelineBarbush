import { EDITABLE_FIELDS } from "@/lib/assistant/registry";

export const TEXT_SIZE_OPTIONS = [
  { value: "small", label: "Small", cssValue: ".9rem" },
  { value: "standard", label: "Standard", cssValue: "1rem" },
  { value: "large", label: "Large", cssValue: "1.15rem" },
] as const;

export type TextSize = (typeof TEXT_SIZE_OPTIONS)[number]["value"];
export type TextSizing = Partial<Record<string, TextSize>>;

const DEFAULT_TEXT_SIZING: TextSizing = {
  "home.heroCopy": "large",
  "about.intro": "standard",
  "about.body": "standard",
  "contact.representation": "small",
  "contact.note": "standard",
  "resume.theater": "small",
  "resume.stagedReadings": "small",
  "resume.film": "small",
  "resume.training": "small",
  "resume.skills": "standard",
};

const allowedRichTextFields = new Set<string>(
  Object.values(EDITABLE_FIELDS)
    .filter((field) => field.type === "richText")
    .map((field) => field.id),
);

function isTextSize(value: unknown): value is TextSize {
  return TEXT_SIZE_OPTIONS.some((option) => option.value === value);
}

export function normalizeTextSizing(input: unknown): TextSizing {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const sizing: TextSizing = { ...DEFAULT_TEXT_SIZING };
  Object.entries(source).forEach(([field, value]) => {
    if (allowedRichTextFields.has(field) && isTextSize(value)) sizing[field] = value;
  });
  return sizing;
}

export function textSizingCssValues(input: TextSizing) {
  const sizing = normalizeTextSizing(input);
  return Object.fromEntries(Object.entries(sizing).map(([field, size]) => [
    field,
    TEXT_SIZE_OPTIONS.find((option) => option.value === size)?.cssValue ?? "1rem",
  ]));
}

export function textSizingCssVariables(input: TextSizing) {
  return Object.fromEntries(Object.entries(textSizingCssValues(input)).map(([field, value]) => [
    `--text-size-${field.replace(/\./g, "-")}`,
    value,
  ]));
}
