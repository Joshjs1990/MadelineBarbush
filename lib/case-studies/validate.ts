import type { CaseStudyInput } from "@/lib/case-studies/store";

/** Every field the site renders without a fallback must be present. */
export function isValidCaseStudy(input: Partial<CaseStudyInput>) {
  return Boolean(
    input.title &&
      input.slug &&
      input.year &&
      input.type &&
      input.role &&
      input.intro &&
      input.description &&
      input.archiveNote &&
      input.longDescription?.length &&
      input.performanceNotes?.length &&
      input.atmosphere &&
      input.heroImage &&
      input.gallery?.length &&
      input.credits?.length &&
      input.pullQuote &&
      input.accentColor &&
      input.textColor &&
      input.relatedProjectSlug,
  );
}
