/**
 * Shape and defaults for the homepage showreel block.
 *
 * Deliberately free of any D1 import so client components can use the type and
 * the defaults without pulling the database into the browser bundle.
 */
export type Showreel = {
  /** Small label in the corner of the frame. */
  label: string;
  /** Headline shown when there is no video yet. */
  title: string;
  /** YouTube URL or direct public R2 video URL. Empty keeps the placeholder. */
  videoUrl: string;
  /** Background image behind the placeholder. */
  posterImage: string;
};

export const SHOWREEL_DEFAULTS: Showreel = {
  label: "Showreel",
  title: "Reel coming soon",
  videoUrl: "",
  posterImage: "/images/actor-wide.jpg",
};

export function normalizeShowreel(input: Partial<Showreel>): Showreel {
  return {
    label: input.label?.trim() || SHOWREEL_DEFAULTS.label,
    title: input.title?.trim() || SHOWREEL_DEFAULTS.title,
    videoUrl: input.videoUrl?.trim() ?? "",
    posterImage: input.posterImage?.trim() || SHOWREEL_DEFAULTS.posterImage,
  };
}
