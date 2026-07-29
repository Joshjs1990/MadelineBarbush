import { projects } from "@/data/projects";

export const runtime = "edge";

export function GET() {
  return Response.json({
    data: projects,
    source: "local",
  });
}
