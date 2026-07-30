export type ProjectCredit = {
  label: string;
  value: string;
};

export type ProjectGalleryImage = {
  src: string;
  alt: string;
  orientation: "portrait" | "landscape" | "square";
};

export type ProjectVideoEmbed = {
  title: string;
  url: string;
};

export type Project = {
  title: string;
  slug: string;
  year: string;
  type: string;
  role: string;
  director?: string;
  productionCompany?: string;
  intro: string;
  description: string;
  archiveNote: string;
  longDescription: string[];
  performanceNotes: string[];
  atmosphere: string;
  heroImage: string;
  gallery: ProjectGalleryImage[];
  videoEmbeds?: ProjectVideoEmbed[];
  trailerUrl?: string;
  credits: ProjectCredit[];
  pullQuote: string;
  accentColor: string;
  textColor: string;
  relatedProjectSlug: string;
  externalLink?: string;
  featured: boolean;
  order: number;
};
