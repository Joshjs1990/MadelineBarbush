import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { actorInfo, getProject, getRelatedProject, projects } from "@/data/projects";
import { absoluteUrl } from "@/lib/utils";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.intro,
    alternates: {
      canonical: `/work/${project.slug}`,
    },
    openGraph: {
      title: `${project.title} | ${actorInfo.name}`,
      description: project.intro,
      url: `/work/${project.slug}`,
      type: "article",
      images: [{ url: project.heroImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | ${actorInfo.name}`,
      description: project.intro,
      images: [project.heroImage],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const related = getRelatedProject(project);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    dateCreated: project.year,
    genre: project.type,
    description: project.intro,
    contributor: {
      "@type": "Person",
      name: actorInfo.name,
      roleName: project.role,
    },
    url: absoluteUrl(`/work/${project.slug}`),
  };

  return (
    <main
      className="case-study"
      style={
        {
          "--accent": project.accentColor,
          "--project-text": project.textColor,
        } as CSSProperties
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="case-hero" aria-labelledby="project-title">
        <div className="case-hero__image">
          <Image src={project.heroImage} alt={`${project.title} project image.`} fill priority sizes="100vw" unoptimized />
        </div>
        <div className="case-hero__text">
          <p className="eyebrow">{project.type} / {project.year}</p>
          <h1 id="project-title">{project.title}</h1>
          <p>{project.role}</p>
        </div>
      </section>
      <section className="case-intro">
        <p>{project.intro}</p>
        <dl>
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Type</dt><dd>{project.type}</dd></div>
          {project.director ? <div><dt>Director</dt><dd>{project.director}</dd></div> : null}
          {project.productionCompany ? <div><dt>Production</dt><dd>{project.productionCompany}</dd></div> : null}
        </dl>
      </section>
      <section className="case-body">
        <blockquote>{project.pullQuote}</blockquote>
        <p>{project.description}</p>
      </section>
      <section className="case-gallery" aria-label={`${project.title} image sequence`}>
        {project.gallery.map((image, index) => (
          <figure className={`case-frame case-frame--${image.orientation}`} key={`${image.src}-${index}`}>
            <Image src={image.src} alt={image.alt} fill sizes={image.orientation === "portrait" ? "(max-width: 768px) 92vw, 42vw" : "100vw"} unoptimized />
          </figure>
        ))}
      </section>
      <section className="case-credits" aria-labelledby="credits-title">
        <h2 id="credits-title">Credits</h2>
        <dl>
          {project.credits.map((credit) => (
            <div key={credit.label}>
              <dt>{credit.label}</dt>
              <dd>{credit.value}</dd>
            </div>
          ))}
        </dl>
        {project.externalLink ? (
          <a href={project.externalLink} target="_blank" rel="noreferrer" data-cursor-label="Open">
            External project link
          </a>
        ) : null}
      </section>
      <Link className="next-project" href={`/work/${related.slug}`} scroll data-cursor-label="Next">
        <span>Next project</span>
        <strong>{related.title}</strong>
      </Link>
    </main>
  );
}
