import { listCaseStudies } from "@/lib/case-studies/store";

export const runtime = "edge";

export async function GET() {
  const projects = await listCaseStudies();

  return Response.json({
    data: projects,
    source: "case-study-store",
  });
}
