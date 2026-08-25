import { actorInfo } from "@/data/projects";

export type EditableFieldType = "text" | "color" | "font";
export type EditableFieldId =
  | "home.heroHeading"
  | "home.heroRole"
  | "home.heroCopy"
  | "home.location"
  | "home.languages"
  | "home.workingAcross"
  | "about.heading"
  | "about.intro"
  | "contact.email"
  | "contact.phone"
  | "theme.accentColor"
  | "theme.headingFont"
  | "seo.description";

export type EditableField = {
  id: EditableFieldId;
  label: string;
  page: string;
  type: EditableFieldType;
  maxLength: number;
  description: string;
};

export const EDITABLE_FIELDS: Record<EditableFieldId, EditableField> = {
  "home.heroHeading": { id: "home.heroHeading", label: "Homepage hero heading", page: "Homepage", type: "text", maxLength: 100, description: "The main name/title in the homepage hero." },
  "home.heroRole": { id: "home.heroRole", label: "Homepage role", page: "Homepage", type: "text", maxLength: 80, description: "The short role shown below the homepage heading." },
  "home.heroCopy": { id: "home.heroCopy", label: "Homepage introduction", page: "Homepage", type: "text", maxLength: 240, description: "The short homepage introduction." },
  "home.location": { id: "home.location", label: "Homepage location", page: "Homepage", type: "text", maxLength: 80, description: "The location shown in the homepage facts." },
  "home.languages": { id: "home.languages", label: "Homepage languages", page: "Homepage", type: "text", maxLength: 100, description: "The language fact shown on the homepage." },
  "home.workingAcross": { id: "home.workingAcross", label: "Homepage disciplines", page: "Homepage", type: "text", maxLength: 100, description: "The film/stage discipline fact shown on the homepage." },
  "about.heading": { id: "about.heading", label: "About page heading", page: "About", type: "text", maxLength: 100, description: "The About page heading." },
  "about.intro": { id: "about.intro", label: "About introduction", page: "About", type: "text", maxLength: 1200, description: "The opening About page paragraph. Preserve the person's factual meaning." },
  "contact.email": { id: "contact.email", label: "Contact email", page: "Contact", type: "text", maxLength: 200, description: "The public contact email address." },
  "contact.phone": { id: "contact.phone", label: "Contact phone", page: "Contact", type: "text", maxLength: 60, description: "The public phone number, when displayed." },
  "theme.accentColor": { id: "theme.accentColor", label: "Accent colour", page: "Sitewide", type: "color", maxLength: 7, description: "The approved site accent colour, stored as a six-digit hex value." },
  "theme.headingFont": { id: "theme.headingFont", label: "Heading font", page: "Sitewide", type: "font", maxLength: 40, description: "The approved heading font choice." },
  "seo.description": { id: "seo.description", label: "Meta description", page: "SEO", type: "text", maxLength: 160, description: "The site meta description." },
};

export const APPROVED_HEADING_FONTS = ["Archivo", "Oswald", "Arial", "Georgia"] as const;
export type HeadingFont = (typeof APPROVED_HEADING_FONTS)[number];

export type EditableContent = {
  home: { heroHeading: string; heroRole: string; heroCopy: string; location: string; languages: string; workingAcross: string };
  about: { heading: string; intro: string };
  contact: { email: string; phone: string };
  theme: { accentColor: string; headingFont: HeadingFont };
  seo: { description: string };
};

export const DEFAULT_EDITABLE_CONTENT: EditableContent = {
  home: { heroHeading: actorInfo.name, heroRole: "Actor", heroCopy: "Actor & writer\nbased in New York City.", location: actorInfo.location, languages: "English + Spanish", workingAcross: "Film + stage" },
  about: { heading: "About Madeline", intro: "Hi! My name is Maddie. I am an actor from PA, now living in NYC. I also write so I can tell stories with other artists—and act some more, of course. They're usually dark and comedic, like me." },
  contact: { email: actorInfo.email, phone: "(717) 317-7861" },
  theme: { accentColor: "#e8ff2a", headingFont: "Oswald" },
  seo: { description: "A project-first actor portfolio shaped around selected film, television, theatre and experimental work." },
};

export function fieldValue(content: EditableContent, id: EditableFieldId): string {
  const [section, key] = id.split(".") as [keyof EditableContent, string];
  return String((content[section] as Record<string, unknown>)[key] ?? "");
}

export function setFieldValue(content: EditableContent, id: EditableFieldId, value: string): EditableContent {
  const [section, key] = id.split(".") as [keyof EditableContent, string];
  return { ...content, [section]: { ...content[section], [key]: value } } as EditableContent;
}

export function normalizeContent(input: unknown): EditableContent {
  const source = input && typeof input === "object" ? input as Partial<EditableContent> : {};
  return {
    home: { ...DEFAULT_EDITABLE_CONTENT.home, ...(source.home ?? {}) },
    about: { ...DEFAULT_EDITABLE_CONTENT.about, ...(source.about ?? {}) },
    contact: { ...DEFAULT_EDITABLE_CONTENT.contact, ...(source.contact ?? {}) },
    theme: { ...DEFAULT_EDITABLE_CONTENT.theme, ...(source.theme ?? {}) } as EditableContent["theme"],
    seo: { ...DEFAULT_EDITABLE_CONTENT.seo, ...(source.seo ?? {}) },
  };
}
