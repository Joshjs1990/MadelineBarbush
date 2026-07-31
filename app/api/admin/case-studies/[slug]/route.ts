import { requireApiUser } from "@/lib/auth/session";
import {
  deleteCaseStudy,
  findCaseStudyForAdmin,
  saveCaseStudy,
  setCaseStudyHidden,
  type CaseStudyInput,
} from "@/lib/case-studies/store";
import { isValidCaseStudy } from "@/lib/case-studies/validate";

export const runtime = "edge";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  try {
    const entry = await findCaseStudyForAdmin(slug);

    if (!entry) {
      return Response.json({ error: "Case study not found." }, { status: 404 });
    }

    return Response.json({ data: entry });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read case study.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: RouteProps) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const input = (await request.json()) as Partial<CaseStudyInput>;

  if (!isValidCaseStudy(input)) {
    return Response.json({ error: "Missing required case-study fields." }, { status: 400 });
  }

  try {
    // Renaming a slug writes a new entry, so the old one is cleared afterwards
    // rather than leaving both live on the site.
    const project = await saveCaseStudy(input as CaseStudyInput);

    if (project.slug !== slug) {
      await deleteCaseStudy(slug);
    }

    return Response.json({ data: project });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save case study.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;
  const body = (await request.json()) as { hidden?: boolean };

  if (typeof body.hidden !== "boolean") {
    return Response.json({ error: "Send a `hidden` boolean." }, { status: 400 });
  }

  try {
    await setCaseStudyHidden(slug, body.hidden);
    return Response.json({ data: { slug, hidden: body.hidden } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to change visibility.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  const guard = await requireApiUser(request);
  if (!guard.ok) return guard.response;

  const { slug } = await params;

  try {
    const result = await deleteCaseStudy(slug);
    return Response.json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete case study.";
    return Response.json({ error: message }, { status: 503 });
  }
}
