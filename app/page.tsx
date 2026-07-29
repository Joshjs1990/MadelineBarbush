import type { Metadata } from "next";
import { HomeExperience } from "@/components/layout/HomeExperience";
import { actorInfo, projects } from "@/data/projects";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Madeleline Barbush | Selected Work",
  description:
    "A project-first actor portfolio shaped around selected film, television, theatre and experimental work.",
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: actorInfo.name,
    jobTitle: "Actor",
    description: actorInfo.descriptor,
    url: absoluteUrl("/"),
    image: absoluteUrl("/images/actor-close.jpg"),
    sameAs: [actorInfo.instagram, actorInfo.imdb, actorInfo.spotlight],
    subjectOf: projects.map((project) => ({
      "@type": "CreativeWork",
      name: project.title,
      url: absoluteUrl(`/work/${project.slug}`),
      dateCreated: project.year,
      genre: project.type,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeExperience />
    </>
  );
}
