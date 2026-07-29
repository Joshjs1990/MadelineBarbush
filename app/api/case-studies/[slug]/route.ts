import { getProject } from "@/data/projects";

export const runtime = "edge";

type CaseStudyRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: CaseStudyRouteProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return Response.json({ error: "Case study not found" }, { status: 404 });
  }

  return Response.json({
    data: project,
    source: "local",
  });
}
