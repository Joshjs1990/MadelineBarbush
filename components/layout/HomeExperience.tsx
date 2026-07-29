"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { actorInfo, projects } from "@/data/projects";
import { InfoPanel } from "@/components/info-panel/InfoPanel";
import { IntroSequence } from "@/components/motion/IntroSequence";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SiteNav } from "@/components/navigation/SiteNav";
import { ProjectIndex } from "@/components/project-index/ProjectIndex";

gsap.registerPlugin(ScrollTrigger);

export function HomeExperience() {
  const [infoOpen, setInfoOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to("[data-hero-name-left]", {
        xPercent: -11,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      gsap.to("[data-hero-name-right]", {
        xPercent: 13,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      gsap.to("[data-hero-image]", {
        scale: 1.08,
        yPercent: 8,
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <SmoothScroll />
      <IntroSequence />
      <CustomCursor />
      <SiteNav onInfo={() => setInfoOpen(true)} />
      <main>
        <section ref={heroRef} className="home-hero" aria-labelledby="home-title">
          <div className="frame-counter" aria-hidden="true">00:01:26 / ROLE INDEX</div>
          <h1 id="home-title" className="hero-name" aria-label={actorInfo.name}>
            <span data-hero-name-left>M.</span>
            <span data-hero-name-right>BAR</span>
          </h1>
          <div className="hero-image-wrap" data-hero-image data-cursor-label="Shift">
            <Image
              src="/images/actor-close.png"
              alt="Editorial portrait of the actor seated indoors, looking directly toward camera."
              priority
              fill
              sizes="(max-width: 768px) 82vw, 42vw"
            />
          </div>
          <div className="hero-strip" aria-hidden="true">
            <Image src="/images/actor-wide.png" alt="" fill priority sizes="100vw" />
          </div>
          <p className="hero-copy">{actorInfo.descriptor}</p>
          <a className="enter-link" href="#work" data-cursor-label="Work">
            Enter work
          </a>
          <button className="change-role" type="button" onClick={() => document.body.classList.toggle("alternate-take")} data-cursor-label="Take">
            Change role
          </button>
        </section>
        <ProjectIndex projects={projects} />
        <section id="reel" className="reel-scene" aria-labelledby="reel-title">
          <p className="eyebrow">Placeholder reel</p>
          <h2 id="reel-title">A reel module can live here without interrupting the work index.</h2>
          <a href="mailto:hello@example.com" data-cursor-label="Email">For roles, collaborations and representation enquiries.</a>
        </section>
      </main>
      <InfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
