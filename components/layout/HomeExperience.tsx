"use client";

import Image from "next/image";
import { projects } from "@/data/projects";
import { ProjectIndex } from "@/components/project-index/ProjectIndex";

export function HomeExperience() {
  return (
    <main>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-image-wrap">
          <Image
            src="/images/actor-wide.png"
            alt="Wide editorial portrait of the actor seated in a domestic bathroom interior."
            priority
            fill
            sizes="100vw"
            unoptimized
          />
        </div>
        <div className="hero-text">
          <h1 id="home-title" className="hero-name">Madeleline Barbush</h1>
          <p className="hero-role">Actor</p>
          <p className="hero-copy">
            Drawn to difficult silences.
            <br />
            Built for shifting roles.
            <br />
            Always becoming other.
          </p>
        </div>
      </section>
      <ProjectIndex projects={projects} />
      <section id="reel" className="reel-scene" aria-labelledby="reel-title">
        <div className="reel-frame" role="img" aria-label="Showreel video frame">
          <span className="reel-frame__label">Showreel</span>
          <h2 id="reel-title">Reel coming soon</h2>
          <span className="reel-frame__play" aria-hidden="true">Play</span>
        </div>
      </section>
    </main>
  );
}
