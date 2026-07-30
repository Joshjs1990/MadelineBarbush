import { findCaseStudy } from "@/lib/case-studies/store";

export const runtime = "edge";

type CaseStudyRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: CaseStudyRouteProps) {
  const { slug } = await params;
  const project = await findCaseStudy(slug);

  if (!project) {
    return Response.json({ error: "Case study not found" }, { status: 404 });
  }

  return Response.json({
    data: project,
    source: "case-study-store",
  });
}
