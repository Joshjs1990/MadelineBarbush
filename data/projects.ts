import type { Project } from "@/types/project";

const glasshouseImage = "/images/work/glasshouse-static.webp";
const serviceDoorImage = "/images/work/saints-service-door.webp";
const motelImage = "/images/work/motel-blue-hour.webp";
const platformImage = "/images/work/platform-strangers.webp";
const rehearsalImage = "/images/work/white-noise-rehearsal.webp";

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
    title: "Glasshouse Static",
    slug: "glasshouse-static",
    year: "2026",
    type: "Feature Film",
    role: "Mara",
    director: "Director TBA",
    productionCompany: "Production TBA",
    intro: "A rain-black corridor piece about surveillance, grief and the lies people rehearse when they think nobody is listening.",
    description:
      "The role holds pressure in small physical decisions: a stopped breath, a glance into glass, a refusal to answer before the room answers for her.",
    archiveNote: "Rain glass, surveillance tension and a character trying to disappear in plain sight.",
    longDescription: [
      "Glasshouse Static follows Mara through a corporate corridor after midnight, where every surface reflects a different version of what she has done.",
      "The performance is built around containment. Dialogue arrives late, the body stays exact, and emotion leaks through reflections rather than confession.",
      "It plays as a contemporary feature thriller with an intimate centre: one person under fluorescent scrutiny, deciding whether silence is still protection.",
    ],
    performanceNotes: [
      "Uses stillness as a way to make the frame feel watched.",
      "Lets panic register through breath and delayed eye contact.",
      "Keeps the character morally readable without making her simple.",
    ],
    atmosphere: "Rain glass, amber spill, corridor silence.",
    heroImage: glasshouseImage,
    gallery: [
      { src: glasshouseImage, alt: "Rain-streaked glass corridor still for Glasshouse Static.", orientation: "landscape" },
      { src: platformImage, alt: "Late platform companion still for Glasshouse Static.", orientation: "landscape" },
    ],
    credits: [
      { label: "Role", value: "Mara" },
      { label: "Director", value: "Director TBA" },
      { label: "Format", value: "Feature Film" },
    ],
    pullQuote: "A thriller performance built from reflection, restraint and the threat of being seen.",
    accentColor: "#f0a42f",
    textColor: "#100d08",
    relatedProjectSlug: "saints-at-the-service-door",
    externalLink: "https://example.com",
    featured: true,
    order: 1,
  },
  {
    title: "Saints at the Service Door",
    slug: "saints-at-the-service-door",
    year: "2025",
    type: "Theatre",
    role: "June",
    director: "Director TBA",
    productionCompany: "Company TBA",
    intro: "A backstage chamber drama where the exit is visible all night and nobody has the nerve to use it.",
    description:
      "June is all nerve and ritual: a performer trying to keep a room alive while the private cost of the performance starts showing through.",
    archiveNote: "Backstage red light, confession-as-ritual and theatre at its most exposed.",
    longDescription: [
      "Saints at the Service Door treats the backstage area as the real stage: a narrow room where costumes, chairs and half-open exits carry the emotional history.",
      "The work asks for directness without theatrical neatness. June can command a room, then lose it by a fraction, and the audience has to sit inside that shift.",
      "Its tension comes from proximity: the sense that the public performance has ended, but the most dangerous scene has only just started.",
    ],
    performanceNotes: [
      "Turns direct address into confrontation rather than explanation.",
      "Uses repeated gestures like a score that slowly breaks down.",
      "Balances theatrical force with the roughness of someone off guard.",
    ],
    atmosphere: "Red safety light, concrete, dust in the doorway.",
    heroImage: serviceDoorImage,
    gallery: [
      { src: serviceDoorImage, alt: "Backstage service-door still for Saints at the Service Door.", orientation: "landscape" },
      { src: rehearsalImage, alt: "Rehearsal-room companion still for Saints at the Service Door.", orientation: "landscape" },
    ],
    credits: [
      { label: "Role", value: "June" },
      { label: "Company", value: "Company TBA" },
      { label: "Format", value: "Theatre" },
    ],
    pullQuote: "A live performance about the moment the mask becomes harder to remove than to wear.",
    accentColor: "#e51f27",
    textColor: "#fff7e8",
    relatedProjectSlug: "motel-blue-hour",
    featured: true,
    order: 2,
  },
  {
    title: "Motel Blue Hour",
    slug: "motel-blue-hour",
    year: "2025",
    type: "Television",
    role: "Rae",
    productionCompany: "Production TBA",
    intro: "A limited-series episode set between check-out and sunrise, where memory behaves like bad reception.",
    description:
      "Rae moves through the episode with the careful politeness of someone who knows every object in the room may become evidence.",
    archiveNote: "TV light, motel dread and an episode balanced between tenderness and suspicion.",
    longDescription: [
      "Motel Blue Hour centres on a room that refuses to become neutral. Every prop feels handled, every pause feels recorded, and the character has to choose which version of the night to keep alive.",
      "The performance sits in a low register. Rae does not explain the damage; she manages it, redirects it and occasionally lets it flash across her face before pulling it back.",
      "The television form allows the role to accumulate detail through repetition: a ritual with the blinds, the way she avoids the mirror, the exact timing of a half-truth.",
    ],
    performanceNotes: [
      "Keeps fear domestic rather than sensational.",
      "Lets the room shape the rhythm of speech and movement.",
      "Builds character through avoidance, not exposition.",
    ],
    atmosphere: "Blue CRT glow, motel rain, green bathroom spill.",
    heroImage: motelImage,
    gallery: [
      { src: motelImage, alt: "Blue-lit motel still for Motel Blue Hour.", orientation: "landscape" },
      { src: glasshouseImage, alt: "Rain glass companion still for Motel Blue Hour.", orientation: "landscape" },
    ],
    videoEmbeds: [
      {
        title: "Reference reel",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
    credits: [
      { label: "Role", value: "Rae" },
      { label: "Production", value: "Production TBA" },
      { label: "Format", value: "Television" },
    ],
    pullQuote: "A motel-room performance tuned to evidence, exhaustion and the sound of almost telling the truth.",
    accentColor: "#2f7dff",
    textColor: "#f8f5ed",
    relatedProjectSlug: "platform-for-strangers",
    featured: true,
    order: 3,
  },
  {
    title: "Platform for Strangers",
    slug: "platform-for-strangers",
    year: "2024",
    type: "Short Film",
    role: "Nina",
    director: "Director TBA",
    intro: "A nocturnal short about a missed train, a found object and two people pretending coincidence is enough of an explanation.",
    description:
      "The performance is clipped and watchful, letting the platform's movement carry the panic the character refuses to name.",
    archiveNote: "Underground fluorescents, wet tile and a stranger story with a sharp pulse.",
    longDescription: [
      "Platform for Strangers begins with a simple discovery and lets the tension expand through delays: the next train, the next answer, the next chance to leave.",
      "Nina is played as someone who has already made one impossible decision before the film starts. The work is in hiding that history without flattening it.",
      "The short uses the platform like a pressure gauge, measuring each silence against the noise of trains that keep arriving too late.",
    ],
    performanceNotes: [
      "Uses clipped timing to create defensive rhythm.",
      "Lets the environment carry the threat instead of overplaying it.",
      "Keeps the final emotional turn small, legible and unsentimental.",
    ],
    atmosphere: "Wet tile, fluorescent hum, red scarf at the edge.",
    heroImage: platformImage,
    gallery: [
      { src: platformImage, alt: "Underground platform still for Platform for Strangers.", orientation: "landscape" },
      { src: motelImage, alt: "Motel companion still for Platform for Strangers.", orientation: "landscape" },
    ],
    credits: [
      { label: "Role", value: "Nina" },
      { label: "Director", value: "Director TBA" },
      { label: "Format", value: "Short Film" },
    ],
    pullQuote: "A short-form thriller performance where every answer arrives one stop late.",
    accentColor: "#d90429",
    textColor: "#fff8ec",
    relatedProjectSlug: "white-noise-rehearsal",
    featured: false,
    order: 4,
  },
  {
    title: "White Noise Rehearsal",
    slug: "white-noise-rehearsal",
    year: "2026",
    type: "Experimental",
    role: "Performer",
    director: "Director TBA",
    productionCompany: "Studio TBA",
    intro: "A stripped-back camera piece about repetition, failed preparation and the strange violence of being watched while practising.",
    description:
      "The performer repeats a scene until intention starts to fray, turning rehearsal into subject matter rather than process.",
    archiveNote: "Mirror wall, tape marks and performance stripped down to repetition under pressure.",
    longDescription: [
      "White Noise Rehearsal uses a bare room as a test site. A chair, tape marks and scattered pages become enough architecture for a performance about control slipping out of shape.",
      "The piece resists polish. It lets boredom, interruption and reset become active materials, asking what remains when a performer stops smoothing the edge.",
      "The camera stays close to process: breath before speech, the tiny irritation of starting again, and the moment rehearsal becomes more revealing than performance.",
    ],
    performanceNotes: [
      "Treats repetition as escalation rather than sameness.",
      "Uses the mirror as a second audience and a source of pressure.",
      "Keeps the work raw without letting it become loose.",
    ],
    atmosphere: "Black floor, cracked mirror, fluorescent discipline.",
    heroImage: rehearsalImage,
    gallery: [
      { src: rehearsalImage, alt: "Rehearsal studio still for White Noise Rehearsal.", orientation: "landscape" },
      { src: serviceDoorImage, alt: "Backstage companion still for White Noise Rehearsal.", orientation: "landscape" },
    ],
    credits: [
      { label: "Role", value: "Performer" },
      { label: "Studio", value: "Studio TBA" },
      { label: "Format", value: "Experimental" },
    ],
    pullQuote: "A performance study about the moment practice becomes the most honest version of the scene.",
    accentColor: "#f3c623",
    textColor: "#0f0f0b",
    relatedProjectSlug: "glasshouse-static",
    featured: false,
    order: 5,
  },
].sort((a, b) => a.order - b.order);

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getRelatedProject(project: Project) {
  return getProject(project.relatedProjectSlug) ?? projects[0];
}
