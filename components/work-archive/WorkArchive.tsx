"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/types/project";

type WorkArchiveProps = {
  projects: Project[];
};

export function WorkArchive({ projects }: WorkArchiveProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const filters = useMemo(() => ["All", ...Array.from(new Set(projects.map((project) => project.type)))], [projects]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeProject, setActiveProject] = useState(projects[0]);

  const visibleProjects = useMemo(
    () => projects.filter((project) => activeFilter === "All" || project.type === activeFilter),
    [activeFilter, projects],
  );

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) {
      return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let currentX = x;
    let currentY = y;
    let raf = 0;

    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
    };

    const tick = () => {
      currentX += (x - currentX) * 0.16;
      currentY += (y - currentY) * 0.16;
      preview.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -48%) rotate(-2deg)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="archive-interactive" aria-label="Interactive works archive">
      <div ref={previewRef} className="archive-hover-preview" aria-hidden="true">
        <Image src={activeProject.heroImage} alt="" fill sizes="320px" unoptimized />
        <span style={{ backgroundColor: activeProject.accentColor }}>{activeProject.year}</span>
      </div>
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
