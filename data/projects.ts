import type { Project } from "@/types/project";

const portraitImage = "/images/actor-close.png";
const wideImage = "/images/actor-wide.png";

export const actorInfo = {
  name: "Madeleline Barbush",
  descriptor: "Actor working across film, television and stage.",
  bio:
    "An actor drawn to complicated characters, uncomfortable silences and stories that refuse the obvious ending.",
  location: "New York / London",
  playingAge: "20s",
  languages: "English",
  skills: "Screen, theatre, movement, devised work",
  representation: "Available on request",
  email: "hello@example.com",
  instagram: "https://instagram.com/",
  imdb: "https://www.imdb.com/",
  spotlight: "https://www.spotlight.com/",
};

export const projects: Project[] = [
  {
    title: "After the Last Train",
    slug: "after-the-last-train",
    year: "2026",
    type: "Feature Film",
    role: "Elias",
    director: "Director TBA",
    productionCompany: "Production TBA",
    intro: "A late-platform study in withheld panic, built around one night and three incompatible versions of the truth.",
    description:
      "A restrained feature-film performance led by silence, misdirection and a character who keeps changing the room by refusing to explain himself.",
    heroImage: portraitImage,
    gallery: [
      { src: portraitImage, alt: "Close editorial portrait for After the Last Train.", orientation: "portrait" },
      { src: wideImage, alt: "Wide domestic film-still image for After the Last Train.", orientation: "landscape" },
    ],
    credits: [
      { label: "Role", value: "Elias" },
      { label: "Director", value: "Director TBA" },
      { label: "Format", value: "Feature Film" },
    ],
    pullQuote: "A character built from pauses, pressure and the small violence of almost speaking.",
    accentColor: "#e8ff2a",
    textColor: "#10100c",
    relatedProjectSlug: "static-between-us",
    externalLink: "https://example.com",
    featured: true,
    order: 1,
  },
  {
    title: "Static Between Us",
    slug: "static-between-us",
    year: "2025",
    type: "Short Film",
    role: "Daniel",
    director: "Director TBA",
    intro: "A compressed short about signal loss, emotional surveillance and the performance of calm.",
    description:
      "A short-form screen role using close framing, fractured dialogue and a cold visual rhythm.",
    heroImage: wideImage,
    gallery: [
      { src: wideImage, alt: "Wide room portrait for Static Between Us.", orientation: "landscape" },
      { src: portraitImage, alt: "Direct portrait for Static Between Us.", orientation: "portrait" },
    ],
    credits: [
      { label: "Role", value: "Daniel" },
      { label: "Director", value: "Director TBA" },
      { label: "Format", value: "Short Film" },
    ],
    pullQuote: "A performance tuned to what happens between the lines, not inside them.",
    accentColor: "#006cff",
    textColor: "#f8f5ed",
    relatedProjectSlug: "the-red-room",
    featured: true,
    order: 2,
  },
  {
    title: "The Red Room",
    slug: "the-red-room",
    year: "2025",
    type: "Theatre",
    role: "Alex",
    productionCompany: "Theatre company TBA",
    intro: "A stage piece where confession turns into choreography and every exit feels rehearsed.",
    description:
      "A theatre role shaped around live tension, direct address and an audience kept close enough to feel implicated.",
    heroImage: portraitImage,
    gallery: [
      { src: portraitImage, alt: "Portrait for The Red Room.", orientation: "portrait" },
      { src: wideImage, alt: "Wide interior image for The Red Room.", orientation: "landscape" },
    ],
    credits: [
      { label: "Role", value: "Alex" },
      { label: "Company", value: "Theatre company TBA" },
      { label: "Format", value: "Theatre" },
    ],
    pullQuote: "A room, a body, a choice repeated until it becomes ritual.",
    accentColor: "#ff3a22",
    textColor: "#fff8ec",
    relatedProjectSlug: "everything-we-left",
    featured: true,
    order: 3,
  },
  {
    title: "Everything We Left",
    slug: "everything-we-left",
    year: "2024",
    type: "Television",
    role: "Mark",
    productionCompany: "Production TBA",
    intro: "A television arc about returning home and finding the old version of yourself still waiting there.",
    description:
      "An episodic performance that moves from defensiveness into tenderness without losing its edge.",
    heroImage: wideImage,
    gallery: [
      { src: wideImage, alt: "Wide editorial image for Everything We Left.", orientation: "landscape" },
      { src: portraitImage, alt: "Close portrait for Everything We Left.", orientation: "portrait" },
    ],
    credits: [
      { label: "Role", value: "Mark" },
      { label: "Production", value: "Production TBA" },
      { label: "Format", value: "Television" },
    ],
    pullQuote: "A return story without nostalgia, performed with the door half open.",
    accentColor: "#ff3fb7",
    textColor: "#15040f",
    relatedProjectSlug: "night-animals",
    featured: false,
    order: 4,
  },
  {
    title: "Night Animals",
    slug: "night-animals",
    year: "2024",
    type: "Independent Film",
    role: "Isaac",
    director: "Director TBA",
    intro: "An independent film set in the strange hour when private habits become public evidence.",
    description:
      "A nocturnal screen role built around nervous humor, appetite and withheld motive.",
    heroImage: portraitImage,
    gallery: [
      { src: portraitImage, alt: "Portrait for Night Animals.", orientation: "portrait" },
      { src: wideImage, alt: "Wide room image for Night Animals.", orientation: "landscape" },
    ],
    credits: [
      { label: "Role", value: "Isaac" },
      { label: "Director", value: "Director TBA" },
      { label: "Format", value: "Independent Film" },
    ],
    pullQuote: "A study of instinct dressed as politeness.",
    accentColor: "#32ff68",
    textColor: "#08140b",
    relatedProjectSlug: "untitled-portrait",
    featured: false,
    order: 5,
  },
  {
    title: "Untitled Portrait",
    slug: "untitled-portrait",
    year: "2026",
    type: "Experimental",
    role: "Performer",
    intro: "A durational experiment in image, repetition and the self as unreliable source material.",
    description:
      "An experimental performance project using camera proximity, repeated gesture and fragmented spoken text.",
    heroImage: wideImage,
    gallery: [
      { src: wideImage, alt: "Wide portrait for Untitled Portrait.", orientation: "landscape" },
      { src: portraitImage, alt: "Close portrait for Untitled Portrait.", orientation: "portrait" },
    ],
    credits: [
      { label: "Role", value: "Performer" },
      { label: "Format", value: "Experimental" },
      { label: "Status", value: "In development" },
    ],
    pullQuote: "The face becomes a set, then a score, then a problem.",
    accentColor: "#6f3cff",
    textColor: "#fff8ec",
    relatedProjectSlug: "after-the-last-train",
    featured: false,
    order: 6,
  },
].sort((a, b) => a.order - b.order);

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getRelatedProject(project: Project) {
  return getProject(project.relatedProjectSlug) ?? projects[0];
}
