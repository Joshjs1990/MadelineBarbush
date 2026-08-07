import type { Metadata } from "next";
import { HomeExperience } from "@/components/layout/HomeExperience";
import { actorInfo } from "@/data/projects";
import { listCaseStudies } from "@/lib/case-studies/store";
import { getShowreel } from "@/lib/site-settings/store";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Madeleline Barbush | Selected Work",
  description:
    "A project-first actor portfolio shaped around selected film, television, theatre and experimental work.",
};

export const dynamic = "force-dynamic";

export default function Home() {
  return <HomePageContent />;
}

async function HomePageContent() {
  const [projects, showreel] = await Promise.all([listCaseStudies(), getShowreel()]);
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
      <HomeExperience showreel={showreel} />
    </>
  );
}
