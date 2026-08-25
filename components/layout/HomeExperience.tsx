"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import { toYouTubeEmbedUrl } from "@/lib/media/youtube";
import { SHOWREEL_DEFAULTS, type Showreel } from "@/lib/site-settings/showreel";
import type { EditableContent } from "@/lib/assistant/registry";

type HomeExperienceProps = { showreel?: Showreel; content?: EditableContent };

export function HomeExperience({ showreel = SHOWREEL_DEFAULTS, content }: HomeExperienceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
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
          <h1 id="home-title" className="hero-name">{content?.home.heroHeading ?? "Madeline Barbush"}</h1>
          <p className="hero-role">{content?.home.heroRole ?? "Actor"}</p>
          <p className="hero-copy">
            {(content?.home.heroCopy ?? "Actor & writer\nbased in New York City.").split("\n").map((line, index) => <span key={`${line}-${index}`}>{index ? <br /> : null}{line}</span>)}
          </p>
        </div>
      </section>
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
            <video ref={videoRef} controls playsInline preload="metadata" poster={showreel.posterImage} onPlay={() => setHasStarted(true)}><source src={directVideoUrl} /></video>
            {!hasStarted ? <button className="reel-frame__play reel-frame__play--video" type="button" onClick={() => void videoRef.current?.play()}><span aria-hidden="true" className="reel-frame__play-icon" /><span>Play reel</span></button> : null}
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
