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
  | "about.body"
  | "contact.email"
  | "contact.phone"
  | "contact.representation"
  | "contact.note"
  | "contact.formHeading"
  | "resume.intro"
  | "resume.theater"
  | "resume.stagedReadings"
  | "resume.film"
  | "resume.training"
  | "resume.skills"
  | "nav.videoLabel"
  | "pages.videoHeading"
  | "pages.videoEmpty"
  | "pages.contactHeading"
  | "pages.resumeHeading"
  | "pages.photosHeading"
  | "pages.performanceStillsHeading"
  | "pages.recentHighlightsHeading"
  | "theme.paper"
  | "theme.ink"
  | "theme.acid"
  | "theme.blue"
  | "theme.verm"
  | "theme.pink"
  | "theme.muted"
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
  "about.body": { id: "about.body", label: "About page body", page: "About", type: "text", maxLength: 5000, description: "The remaining About page paragraphs, separated by blank lines." },
  "contact.email": { id: "contact.email", label: "Contact email", page: "Contact", type: "text", maxLength: 200, description: "The public contact email address." },
  "contact.phone": { id: "contact.phone", label: "Contact phone", page: "Contact", type: "text", maxLength: 60, description: "The public phone number, when displayed." },
  "contact.representation": { id: "contact.representation", label: "Contact representation", page: "Contact", type: "text", maxLength: 500, description: "The representation and theatrical representation note, separated by blank lines." },
  "contact.note": { id: "contact.note", label: "Contact form note", page: "Contact", type: "text", maxLength: 240, description: "The note above the contact form." },
  "contact.formHeading": { id: "contact.formHeading", label: "Contact form heading", page: "Contact", type: "text", maxLength: 100, description: "The heading above the contact form." },
  "resume.intro": { id: "resume.intro", label: "Resume introduction", page: "Resume", type: "text", maxLength: 240, description: "The identity line at the top of the resume page." },
  "resume.theater": { id: "resume.theater", label: "Theater credits", page: "Resume", type: "text", maxLength: 5000, description: "Theater credits, one per line as Title | Role | Detail." },
  "resume.stagedReadings": { id: "resume.stagedReadings", label: "Staged readings", page: "Resume", type: "text", maxLength: 2000, description: "Staged reading credits, one per line as Title | Detail." },
  "resume.film": { id: "resume.film", label: "Film credits", page: "Resume", type: "text", maxLength: 6000, description: "Film and screen credits, one per line as Title | Role | Detail." },
  "resume.training": { id: "resume.training", label: "Training", page: "Resume", type: "text", maxLength: 3000, description: "Training credits, one per line as Institution | Detail." },
  "resume.skills": { id: "resume.skills", label: "Special skills", page: "Resume", type: "text", maxLength: 1200, description: "The special skills paragraph." },
  "nav.videoLabel": { id: "nav.videoLabel", label: "Video navigation label", page: "Site navigation", type: "text", maxLength: 40, description: "The label for the video/reels link in the site header." },
  "pages.videoHeading": { id: "pages.videoHeading", label: "Video page heading", page: "Video", type: "text", maxLength: 100, description: "The Video page heading." },
  "pages.videoEmpty": { id: "pages.videoEmpty", label: "Video empty state", page: "Video", type: "text", maxLength: 240, description: "The message shown when no videos are assigned to the Video page." },
  "pages.contactHeading": { id: "pages.contactHeading", label: "Contact page heading", page: "Contact", type: "text", maxLength: 100, description: "The Contact page heading." },
  "pages.resumeHeading": { id: "pages.resumeHeading", label: "Resume page heading", page: "Resume", type: "text", maxLength: 100, description: "The Resume page heading." },
  "pages.photosHeading": { id: "pages.photosHeading", label: "Photos page heading", page: "Photos", type: "text", maxLength: 100, description: "The Photos page heading." },
  "pages.performanceStillsHeading": { id: "pages.performanceStillsHeading", label: "Performance stills heading", page: "Performance Stills", type: "text", maxLength: 100, description: "The Performance Stills page heading." },
  "pages.recentHighlightsHeading": { id: "pages.recentHighlightsHeading", label: "Recent Highlights heading", page: "Recent Highlights", type: "text", maxLength: 100, description: "The Recent Highlights page heading." },
  "theme.paper": { id: "theme.paper", label: "Surface / paper", page: "Sitewide", type: "color", maxLength: 7, description: "The sitewide surface colour." },
  "theme.ink": { id: "theme.ink", label: "Primary ink", page: "Sitewide", type: "color", maxLength: 7, description: "The sitewide primary text colour." },
  "theme.acid": { id: "theme.acid", label: "Primary accent", page: "Sitewide", type: "color", maxLength: 7, description: "The main highlight and active-state colour." },
  "theme.blue": { id: "theme.blue", label: "Focus blue", page: "Sitewide", type: "color", maxLength: 7, description: "The blue interface accent." },
  "theme.verm": { id: "theme.verm", label: "Vermilion", page: "Sitewide", type: "color", maxLength: 7, description: "The vermilion accent colour." },
  "theme.pink": { id: "theme.pink", label: "Pink", page: "Sitewide", type: "color", maxLength: 7, description: "The pink accent colour." },
  "theme.muted": { id: "theme.muted", label: "Muted text", page: "Sitewide", type: "color", maxLength: 7, description: "The secondary text colour." },
  "theme.accentColor": { id: "theme.accentColor", label: "Accent colour", page: "Sitewide", type: "color", maxLength: 7, description: "The approved site accent colour, stored as a six-digit hex value." },
  "theme.headingFont": { id: "theme.headingFont", label: "Heading font", page: "Sitewide", type: "font", maxLength: 40, description: "The approved heading font choice." },
  "seo.description": { id: "seo.description", label: "Meta description", page: "SEO", type: "text", maxLength: 160, description: "The site meta description." },
};

export const APPROVED_HEADING_FONTS = ["Archivo", "Oswald", "Arial", "Georgia"] as const;
export type HeadingFont = (typeof APPROVED_HEADING_FONTS)[number];

export type EditableContent = {
  home: { heroHeading: string; heroRole: string; heroCopy: string; location: string; languages: string; workingAcross: string };
  about: { heading: string; intro: string; body: string };
  contact: { email: string; phone: string; representation: string; note: string; formHeading: string };
  resume: { intro: string; theater: string; stagedReadings: string; film: string; training: string; skills: string };
  nav: { videoLabel: string };
  pages: { videoHeading: string; videoEmpty: string; contactHeading: string; resumeHeading: string; photosHeading: string; performanceStillsHeading: string; recentHighlightsHeading: string };
  theme: { paper: string; ink: string; acid: string; blue: string; verm: string; pink: string; muted: string; accentColor: string; headingFont: HeadingFont };
  seo: { description: string };
};

export const DEFAULT_EDITABLE_CONTENT: EditableContent = {
  home: { heroHeading: actorInfo.name, heroRole: "Actor", heroCopy: "Actor & writer\nbased in New York City.", location: actorInfo.location, languages: "English + Spanish", workingAcross: "Film + stage" },
  about: { heading: "About Madeline", intro: "Hi! My name is Maddie. I am an actor from PA, now living in NYC. I also write so I can tell stories with other artists—and act some more, of course. They're usually dark and comedic, like me.", body: "I studied Art History and Cinema at Temple University. I went on to work at the Philadelphia Museum of Art and other art museums in Madrid & Mexico City. I speak Spanish and love to travel solo. I feel invincible when I can combine the two.\n\nI started acting in Madrid for filmmaker friends who knew I was an actor before I did. It ignited a passion within me that museum work never could. Surprise surprise.\n\nI have trained in the Meisner Technique at Playhouse West Philadelphia, where I began to write and make short films and plays. I moved to NYC to begin working as an actor, while continuing my studies with Deborah Hedwall. I just completed the Mentorship Program for Emerging Artists at The Actor's Center. Among many others, I studied with Ron VanLieu who is an absolute and actual legend.\n\nI work in both film and theater. I am in the upcoming feature, Flapjax (Dir. Rocko Zevenbergen), playing the punk rock sweetheart, Louie. I am beginning pre-production for my short film, AC, in which I will star." },
  contact: { email: actorInfo.email, phone: "(717) 317-7861", representation: "Commercial Representation:\nBBR Talent Agency\nTracey Goldblum\n\nI am seeking theatrical representation.", note: "Or fill out the information on this page.", formHeading: "Send an enquiry" },
  resume: { intro: "Madeline Grace Barbush · Actor · Writer · New York City", theater: "The Midnight Chapters | Kim / Quinn | A.R.T. / New York Theatres\nRoyal Oak | Autumn | Soho Playhouse\nSay Gay | Jace | Blank Page Theatre Company\nThis Grass Kills People | Oren | Blank Page Theatre Company\nOur Lady of 121st Street | Marcia | Open Hydrant Theater\nGingham Dog | Barbara | Playhouse West\nIn Arabia We’d All Be Kings | Chickie | Open Hydrant Theater\nAll in a Day’s Work | Fran / Donna / Marci / Angie | Playhouse West", stagedReadings: "In the Dark | J · Ensemble Studio Theatre / Drew University\nThe Hideous Progeny | Mary Godwin · Ensemble Studio Theatre / Drew University", film: "I Fell in Love with a Z-Grade Director in Brooklyn | Supporting | Feature · Dir. Kenichi Ugana\nFlapjax | Supporting | Feature · Dir. Rocko Zevenbergen\nEleanor Slaughter | Supporting | Feature · Dir. Chris Chan Roberson\nGilly and Keeves | Supporting | YouTube Series · Dir. McKeever\nThe Redemption of Donna Asher | Supporting | Animated Feature · Dir. Steven Adams\nDig a Pony | Lead | Feature · Dir. Demi Lashaw\nProm Night | Lead | Short · Brooklyn College Thesis\nManfreed | Supporting | Feature · Dir. Will Rittweger\nAbout James | Supporting | Short · Alice Weber\nJuniper | Supporting | Short · Dir. Pratigya Paudel\nMade | Lead | Short · Dir. Ian Mosley-Duffy", training: "The Actors Center | Mentorship Program for Emerging Artists · 2025–2026\nPlayhouse West Philadelphia | Meisner Technique · Artistic Director Tony Savant · July 2020–October 2022\nDeborah Hedwall | Scene Study · Uta Hagen, Stella Adler, Meisner Technique\nKaren Braga | Alexander Technique", skills: "Screenwriter · fluent in Spanish · dialects and languages · improvisation · tumbling · basketball · swimming · running · yoga · biking · U.S. passport · NY State Driver's License" },
  nav: { videoLabel: "Video" },
  pages: { videoHeading: "Video", videoEmpty: "Add a video in the media library and check “Videos page” to display it here.", contactHeading: "Contact", resumeHeading: "Resume", photosHeading: "Photos", performanceStillsHeading: "Performance Stills", recentHighlightsHeading: "Recent Highlights" },
  theme: { paper: "#ffffff", ink: "#10100c", acid: "#e8ff2a", blue: "#006cff", verm: "#ff3a22", pink: "#ff3fb7", muted: "#6f6a60", accentColor: "#e8ff2a", headingFont: "Oswald" },
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
    resume: { ...DEFAULT_EDITABLE_CONTENT.resume, ...(source.resume ?? {}) },
    nav: { ...DEFAULT_EDITABLE_CONTENT.nav, ...(source.nav ?? {}) },
    pages: { ...DEFAULT_EDITABLE_CONTENT.pages, ...(source.pages ?? {}) },
    theme: { ...DEFAULT_EDITABLE_CONTENT.theme, ...(source.theme ?? {}), acid: (source.theme as EditableContent["theme"] | undefined)?.acid ?? (source.theme as EditableContent["theme"] | undefined)?.accentColor ?? DEFAULT_EDITABLE_CONTENT.theme.acid, accentColor: (source.theme as EditableContent["theme"] | undefined)?.acid ?? (source.theme as EditableContent["theme"] | undefined)?.accentColor ?? DEFAULT_EDITABLE_CONTENT.theme.acid } as EditableContent["theme"],
    seo: { ...DEFAULT_EDITABLE_CONTENT.seo, ...(source.seo ?? {}) },
  };
}
