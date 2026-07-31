import { requireApiUser } from "@/lib/auth/session";
import { listCaseStudiesForAdmin, saveCaseStudy, type CaseStudyInput } from "@/lib/case-studies/store";
import { isValidCaseStudy } from "@/lib/case-studies/validate";

export const runtime = "edge";

export async function GET(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  try {
    return Response.json({ data: await listCaseStudiesForAdmin(), source: "case-study-store" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read case studies.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  const input = (await request.json()) as Partial<CaseStudyInput>;

  if (!isValidCaseStudy(input)) {
    return Response.json({ error: "Missing required case-study fields." }, { status: 400 });
  }

  try {
    const project = await saveCaseStudy(input as CaseStudyInput);
    return Response.json({ data: project }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save case study.";
    return Response.json({ error: message }, { status: 503 });
  }
}
