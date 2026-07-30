import { createCaseStudy, listCaseStudies, type CaseStudyInput } from "@/lib/case-studies/store";

export const runtime = "edge";

function isValidCaseStudy(input: Partial<CaseStudyInput>) {
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

export async function GET() {
  const projects = await listCaseStudies();

  return Response.json({
    data: projects,
    source: "case-study-store",
  });
}

export async function POST(request: Request) {
  const input = (await request.json()) as Partial<CaseStudyInput>;

  if (!isValidCaseStudy(input)) {
    return Response.json({ error: "Missing required case-study fields." }, { status: 400 });
  }

  try {
    const project = await createCaseStudy(input as CaseStudyInput);
    return Response.json({ data: project }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save case study.";
    return Response.json({ error: message }, { status: 503 });
  }
}
