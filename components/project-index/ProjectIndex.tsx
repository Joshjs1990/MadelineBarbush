"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/types/project";

gsap.registerPlugin(ScrollTrigger);

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

    const ctx = gsap.context(() => {
      gsap.from("[data-project-row]", {
        yPercent: 80,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root,
          start: "top 72%",
        },
      });

      gsap.to("[data-credit-roll]", {
        xPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

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
    <section id="work" ref={rootRef} className="project-index" aria-labelledby="work-title">
      <div data-credit-roll className="credit-roll" aria-hidden="true">
        Work / Selected Roles / Screen / Stage / Voice / Work / Selected Roles /
      </div>
      <div className="index-heading">
        <p className="eyebrow">Selected projects</p>
        <h2 id="work-title">Projects are the front door.</h2>
      </div>
      <div ref={previewRef} className="project-preview" aria-hidden="true">
        <Image src={activeProject.heroImage} alt="" fill sizes="320px" />
        <span style={{ backgroundColor: activeProject.accentColor }}>{activeProject.year}</span>
      </div>
      <ol className="project-list">
        {projects.map((project) => (
          <li
            key={project.slug}
            data-project-row
            style={{ "--accent": project.accentColor, "--project-text": project.textColor } as CSSProperties}
            onPointerEnter={() => setActiveProject(project)}
            onFocus={() => setActiveProject(project)}
          >
            <Link href={`/work/${project.slug}`} data-cursor-label="Open" aria-label={`Open project ${project.title}`}>
              <span className="project-number">{String(project.order).padStart(2, "0")}</span>
              <span className="project-title">{project.title}</span>
              <span className="project-meta">
                <span>{project.type}</span>
                <span>{project.role}</span>
                <span>{project.year}</span>
              </span>
              <span className="project-mobile-image">
                <Image src={project.heroImage} alt="" fill sizes="96vw" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
