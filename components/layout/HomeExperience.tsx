"use client";

import { useRef, useState, type CSSProperties } from "react";
import { toYouTubeEmbedUrl } from "@/lib/media/youtube";
import { YouTubeEmbed } from "@/components/media/YouTubeEmbed";
import { SHOWREEL_DEFAULTS, type Showreel } from "@/lib/site-settings/showreel";
import type { EditableContent } from "@/lib/assistant/registry";
import type { SiteImage } from "@/lib/site-settings/media";
import { EditableImage, EditableRichText, EditableText } from "@/components/editor/Editable";

type HomeExperienceProps = { showreel?: Showreel; content?: EditableContent; homeImage?: SiteImage };

export function HomeExperience({ showreel = SHOWREEL_DEFAULTS, content, homeImage }: HomeExperienceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const embedUrl = showreel.videoUrl ? toYouTubeEmbedUrl(showreel.videoUrl) : null;
  const directVideoUrl = showreel.videoUrl && !embedUrl ? showreel.videoUrl : null;
  return (
    <main>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-image-wrap">
          <EditableImage
            field="home.heroImage"
            src={homeImage?.src ?? "/images/actor-wide.jpg"}
            alt={homeImage?.alt ?? "Wide editorial portrait of the actor seated in a domestic bathroom interior."}
            focalX={homeImage?.focalX}
            focalY={homeImage?.focalY}
            fit={homeImage?.fit}
            priority
            fill
            sizes="100vw"
          />
        </div>
        <div className="hero-text">
          <h1 id="home-title" className="hero-name"><EditableText field="home.heroHeading">{content?.home.heroHeading ?? "Madeline Barbush"}</EditableText></h1>
          <p className="hero-role"><EditableText field="home.heroRole">{content?.home.heroRole ?? "Actor"}</EditableText></p>
          <EditableRichText field="home.heroCopy" className="hero-copy" value={content?.home.heroCopy ?? "Actor & writer\nbased in New York City."} />
        </div>
      </section>
      <section id="reel" className="reel-scene" aria-labelledby="reel-title">
        {embedUrl ? (
          <div className="reel-frame reel-frame--video">
            <h2 id="reel-title" className="sr-only">
              {showreel.label}
            </h2>
            <YouTubeEmbed embedUrl={embedUrl} title={showreel.label} url={showreel.videoUrl} />
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
