"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { ProjectIndex } from "@/components/project-index/ProjectIndex";
import { toYouTubeEmbedUrl } from "@/lib/media/youtube";
import { SHOWREEL_DEFAULTS, type Showreel } from "@/lib/site-settings/showreel";
import type { Project } from "@/types/project";

type HomeExperienceProps = {
  projects: Project[];
  showreel?: Showreel;
};

export function HomeExperience({ projects, showreel = SHOWREEL_DEFAULTS }: HomeExperienceProps) {
  const embedUrl = showreel.videoUrl ? toYouTubeEmbedUrl(showreel.videoUrl) : null;
  const directVideoUrl = showreel.videoUrl && !embedUrl ? showreel.videoUrl : null;
  return (
    <main>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-image-wrap">
          <Image
            src="/images/actor-wide.jpg"
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
        {embedUrl ? (
          <div className="reel-frame reel-frame--video">
            <h2 id="reel-title" className="sr-only">
              {showreel.label}
            </h2>
            <iframe
              src={embedUrl}
              title={showreel.label}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : directVideoUrl ? (
          <div className="reel-frame reel-frame--video">
            <h2 id="reel-title" className="sr-only">{showreel.label}</h2>
            <video controls playsInline preload="metadata" poster={showreel.posterImage}><source src={directVideoUrl} /></video>
          </div>
        ) : (
          <div
            className="reel-frame"
            role="img"
            aria-label="Showreel video frame"
            style={{ "--reel-poster": `url("${showreel.posterImage}")` } as CSSProperties}
          >
            <span className="reel-frame__label">{showreel.label}</span>
            <h2 id="reel-title">{showreel.title}</h2>
            <span className="reel-frame__play" aria-hidden="true">Play</span>
          </div>
        )}
      </section>
    </main>
  );
}
