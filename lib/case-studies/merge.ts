import type { Project } from "../../types/project";

export function mergeCaseStudyLists(seedProjects: Project[], databaseProjects: Project[]) {
  const merged = new Map(seedProjects.map((project) => [project.slug, project]));

  for (const project of databaseProjects) {
    merged.set(project.slug, project);
  }

  return Array.from(merged.values()).sort((a, b) => a.order - b.order);
}
