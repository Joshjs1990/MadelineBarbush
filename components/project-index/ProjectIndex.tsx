"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/types/project";
import { getGsap } from "@/lib/motion/gsap";
import { motionEases, motionStaggers } from "@/lib/motion/config";

type ProjectIndexProps = {
  projects: Project[];
};

export function ProjectIndex({ projects }: ProjectIndexProps) {
  const rootRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [activeProject, setActiveProject] = useState(projects[0]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        root,
        {
          y: "18svh",
          clipPath: "inset(12% 0% 0% 0%)",
        },
        {
          y: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          ease: motionEases.soft,
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "top 24%",
            scrub: 0.85,
          },
        },
      );

      gsap.from("[data-project-row]", {
        yPercent: 18,
        opacity: 0,
        stagger: motionStaggers.row,
        duration: 0.75,
        ease: motionEases.soft,
        scrollTrigger: {
          trigger: root,
          start: "top 58%",
        },
      });
    }, root);

    return () => ctx.revert();
  }, [projects]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) {
      return;
    }

    let x = 0;
    let y = 0;
    let currentX = 0;
    let currentY = 0;
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
    <section
      id="work"
      ref={rootRef}
      className="project-index"
      aria-label="Selected projects"
    >
      <div ref={previewRef} className="project-preview" aria-hidden="true">
        <Image src={activeProject.heroImage} alt="" fill sizes="320px" unoptimized />
        <span style={{ backgroundColor: activeProject.accentColor }}>{activeProject.year}</span>
      </div>
      <ol className="project-list">
        {projects.map((project, index) => (
          <li
            key={project.slug}
            data-project-row={index}
            style={{ "--accent": project.accentColor, "--project-text": project.textColor } as CSSProperties}
            onPointerEnter={() => setActiveProject(project)}
            onFocus={() => setActiveProject(project)}
          >
            <Link href={`/work/${project.slug}`} scroll data-cursor-label="Open" aria-label={`Open project ${project.title}`}>
              <span className="project-title">{project.title}</span>
              <span className="project-meta">
                <span>{project.type}</span>
                <span>{project.role}</span>
                <span>{project.year}</span>
              </span>
              <span className="project-mobile-image">
                <Image src={project.heroImage} alt="" fill sizes="96vw" unoptimized />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
