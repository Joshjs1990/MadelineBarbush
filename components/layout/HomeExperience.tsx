"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import { toYouTubeEmbedUrl } from "@/lib/media/youtube";
import { SHOWREEL_DEFAULTS, type Showreel } from "@/lib/site-settings/showreel";

type HomeExperienceProps = { showreel?: Showreel };

export function HomeExperience({ showreel = SHOWREEL_DEFAULTS }: HomeExperienceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
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
          <h1 id="home-title" className="hero-name">Madeline Barbush</h1>
          <p className="hero-role">Actor</p>
          <p className="hero-copy">
            Actor & writer<br />based in New York City.
          </p>
        </div>
      </section>
      <section className="highlights" aria-labelledby="highlights-title"><div className="highlights__heading"><p className="eyebrow">Recent highlights</p><h2 id="highlights-title"><span>On screen,</span><span>on stage,</span><span>in progress.</span></h2></div><div className="highlights__list"><article><p>Feature</p><h3>Flapjax</h3><span>Louie · Dir. Rocko Zevenbergen</span></article><article><p>Short film</p><h3>AC</h3><span>In pre-production · Actor / writer</span></article><article><p>Training</p><h3>The Actor&apos;s Center</h3><span>Mentorship Program for Emerging Artists</span></article></div></section>
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
            <video ref={videoRef} controls playsInline preload="metadata" poster={showreel.posterImage} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}><source src={directVideoUrl} /></video>
            <button className="reel-frame__play reel-frame__play--video" type="button" onClick={() => { if (videoRef.current?.paused) void videoRef.current.play(); else videoRef.current?.pause(); }}>{playing ? "Pause" : "Play reel"}</button>
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
