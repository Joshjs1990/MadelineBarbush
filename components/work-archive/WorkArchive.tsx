"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import type { Project } from "@/types/project";

type WorkArchiveProps = {
  projects: Project[];
};

export function WorkArchive({ projects }: WorkArchiveProps) {
  const filters = useMemo(() => ["All", ...Array.from(new Set(projects.map((project) => project.type)))], [projects]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeProject, setActiveProject] = useState(projects[0]);

  const visibleProjects = useMemo(
    () => projects.filter((project) => activeFilter === "All" || project.type === activeFilter),
    [activeFilter, projects],
  );

  return (
    <section className="archive-interactive" aria-label="Interactive works archive">
      <div className="archive-controls" aria-label="Filter works">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={activeFilter === filter}
            onClick={() => {
              setActiveFilter(filter);
              setActiveProject(filter === "All" ? projects[0] : projects.find((project) => project.type === filter) ?? projects[0]);
            }}
          >
            {filter}
          </button>
        ))}
      </div>
      <div
        className="archive-preview-pane"
        style={
          {
            "--accent": activeProject.accentColor,
            "--project-text": activeProject.textColor,
          } as CSSProperties
        }
      >
        <div className="archive-preview-image">
          <Image src={activeProject.heroImage} alt="" fill sizes="(max-width: 900px) 100vw, 34vw" unoptimized />
        </div>
        <div>
          <p>{activeProject.year} / {activeProject.type}</p>
          <h2>{activeProject.title}</h2>
          <span>{activeProject.archiveNote}</span>
        </div>
      </div>
      <ol className="archive-list">
        {visibleProjects.map((project) => (
          <li key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              scroll
              onMouseEnter={() => setActiveProject(project)}
              onFocus={() => setActiveProject(project)}
              style={
                {
                  "--accent": project.accentColor,
                  "--project-text": project.textColor,
                } as CSSProperties
              }
              data-cursor-label="Open"
            >
              <span className="archive-title">{project.title}</span>
              <span className="archive-note">{project.archiveNote}</span>
              <span className="archive-meta">
                <span>{project.type}</span>
                <span>{project.role}</span>
                <span>{project.year}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
