import type { Metadata } from "next";
import { WorkArchive } from "@/components/work-archive/WorkArchive";
import { actorInfo, projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Works",
  description: `An interactive archive of selected performance work by ${actorInfo.name}.`,
};

export default function WorksPage() {
  return (
    <main className="archive-page">
      <section className="archive-hero" aria-labelledby="archive-title">
        <p className="eyebrow">Works archive</p>
        <h1 id="archive-title">Projects are the front door.</h1>
        <p>
          Selected screen, stage and experimental work, arranged as a living index of roles,
          atmospheres and performance textures.
        </p>
      </section>
      <WorkArchive projects={projects} />
    </main>
  );
}
