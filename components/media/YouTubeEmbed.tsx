"use client";

import { useEffect, useState } from "react";
import { getYouTubeThumbnailUrl } from "@/lib/media/youtube";

export const MEDIA_PLAY_EVENT = "madeline-media-play";

type YouTubeEmbedProps = {
  embedUrl: string;
  title: string;
  url: string;
};

export function YouTubeEmbed({ embedUrl, title, url }: YouTubeEmbedProps) {
  const [active, setActive] = useState(false);
  const thumbnailUrl = getYouTubeThumbnailUrl(url);

  useEffect(() => {
    const pauseWhenAnotherStarts = () => setActive(false);
    window.addEventListener(MEDIA_PLAY_EVENT, pauseWhenAnotherStarts);

    return () => window.removeEventListener(MEDIA_PLAY_EVENT, pauseWhenAnotherStarts);
  }, []);

  const playUrl = (() => {
    try {
      const nextUrl = new URL(embedUrl);
      nextUrl.searchParams.set("autoplay", "1");
      nextUrl.searchParams.set("playsinline", "1");
      nextUrl.searchParams.set("enablejsapi", "1");
      if (typeof window !== "undefined") {
        nextUrl.searchParams.set("origin", window.location.origin);
      }
      return nextUrl.toString();
    } catch {
      return embedUrl;
    }
  })();

  if (active) {
    return <iframe src={playUrl} title={title} tabIndex={-1} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />;
  }

  return (
    <button
      className="work-youtube-poster"
      type="button"
      aria-label={`Play ${title}`}
      style={thumbnailUrl ? { backgroundImage: `url("${thumbnailUrl}")` } : undefined}
      onClick={() => {
        window.dispatchEvent(new Event(MEDIA_PLAY_EVENT));
        setActive(true);
      }}
    >
      <span aria-hidden="true">Play video</span>
    </button>
  );
}
