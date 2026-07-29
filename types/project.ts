export type ProjectCredit = {
  label: string;
  value: string;
};

export type ProjectGalleryImage = {
  src: string;
  alt: string;
  orientation: "portrait" | "landscape" | "square";
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
  heroImage: string;
  gallery: ProjectGalleryImage[];
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
