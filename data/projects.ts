import type { Project } from "@/types/project";

const portraitImage = "/images/actor-close.jpg";
const wideImage = "/images/actor-wide.jpg";

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
    archiveNote: "Held tension, night movement and a performance that keeps changing temperature.",
    longDescription: [
      "The work is built around withheld information: a person arriving too late, a platform that will not empty, and a conversation where every answer creates a second question.",
      "The performance tracks panic without announcing it. The body stays economical, the voice stays close, and the pressure is allowed to collect in glances, pauses and interrupted gestures.",
      "Across the piece, the character becomes less readable rather than more explained, giving the film a quiet, unstable centre.",
    ],
    performanceNotes: [
      "Uses stillness as a pressure point rather than a neutral state.",
      "Keeps emotional turns small enough for the camera to discover them.",
      "Builds the role through listening, withheld breath and delayed reaction.",
    ],
    atmosphere: "Terminal light, wet concrete, fluorescent quiet.",
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
    archiveNote: "A compact screen study about distance, signal loss and controlled damage.",
    longDescription: [
      "Static Between Us compresses a relationship into fragments: half-heard calls, repeated rooms and a character trying to perform calm while everything around them becomes evidence.",
      "The role asks for a precision that sits below dialogue. Each scene shifts by a degree rather than a declaration, letting the camera register the unease before the character can name it.",
      "The result is a short-form piece with a cold surface and a volatile interior.",
    ],
    performanceNotes: [
      "Lets silence interrupt the rhythm of speech.",
      "Uses close framing to expose micro-shifts in control.",
      "Balances nervous restraint against flashes of directness.",
    ],
    atmosphere: "Blue monitor light, cut lines, rooms that listen back.",
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
    archiveNote: "A live piece where confession becomes choreography and the room turns accusatory.",
    longDescription: [
      "The Red Room uses the stage as a pressure chamber. Repetition, direct address and choreographed confession pull the audience into the character's private logic.",
      "The performance moves between intimacy and display, allowing vulnerability to become theatrical without losing its danger.",
      "Because the work is live, the tension depends on exact timing: when to hold the room, when to break it, and when to let the audience feel caught looking.",
    ],
    performanceNotes: [
      "Works with direct address as confrontation rather than explanation.",
      "Treats repeated gesture as a score for emotional escalation.",
      "Uses proximity and tempo to keep the audience implicated.",
    ],
    atmosphere: "Red wash, exposed breath, exits that feel rehearsed.",
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
    archiveNote: "Episodic work about return, memory and the old self refusing to leave.",
    longDescription: [
      "Everything We Left follows a character returning to a place that remembers them too accurately. The arc sits in the tension between self-protection and the need to be seen.",
      "The performance begins with guarded rhythm and clipped exchanges, then gradually lets tenderness appear without softening the character's contradictions.",
      "The television structure allows the role to accumulate detail over time, making small reversals feel lived in rather than engineered.",
    ],
    performanceNotes: [
      "Builds continuity through repeated behavioral tells.",
      "Lets warmth arrive with resistance still attached.",
      "Keeps the return story unsentimental and alert.",
    ],
    atmosphere: "Old rooms, open doors, daylight that catches everything.",
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
    archiveNote: "Nocturnal independent film work: instinct, appetite and polished unease.",
    longDescription: [
      "Night Animals sits in the hour when ordinary behavior starts to look suspicious. The role leans into charm as a mask, then lets the mask slip in ways that are difficult to measure.",
      "The character's humor is never only comic; it is a way to redirect attention, delay consequence and keep motive just out of reach.",
      "The piece depends on the friction between social polish and private appetite, with the performance carrying both at once.",
    ],
    performanceNotes: [
      "Uses humor as misdirection and pressure release.",
      "Keeps motive withheld without making the character opaque.",
      "Lets nocturnal pacing shape the physical rhythm.",
    ],
    atmosphere: "Streetlight, late kitchens, appetite under glass.",
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
    archiveNote: "A durational camera piece about image, repetition and unreliable selfhood.",
    longDescription: [
      "Untitled Portrait treats the face as a changing set. Gesture repeats until it becomes unstable, and spoken fragments refuse to settle into a single account.",
      "The performance is less about character biography than presence: what can be read, what can be performed, and what disappears when the camera comes too close.",
      "The piece allows discomfort, boredom and interruption to become active materials rather than problems to smooth away.",
    ],
    performanceNotes: [
      "Uses repetition to make small differences visible.",
      "Lets camera proximity complicate rather than clarify identity.",
      "Keeps the body available to accident, pause and interruption.",
    ],
    atmosphere: "White wall, hard focus, repetition turning strange.",
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
