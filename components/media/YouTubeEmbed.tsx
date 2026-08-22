"use client";

import { useState } from "react";
import { getYouTubeThumbnailUrl } from "@/lib/media/youtube";

type YouTubeEmbedProps = {
  embedUrl: string;
  title: string;
  url: string;
};

export function YouTubeEmbed({ embedUrl, title, url }: YouTubeEmbedProps) {
  const [active, setActive] = useState(false);
  const thumbnailUrl = getYouTubeThumbnailUrl(url);

  if (active) {
    return <iframe src={embedUrl} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />;
  }

  return (
    <button
      className="work-youtube-poster"
      type="button"
      aria-label={`Play ${title}`}
      style={thumbnailUrl ? { backgroundImage: `url("${thumbnailUrl}")` } : undefined}
      onClick={() => setActive(true)}
    >
      <span aria-hidden="true">Play video</span>
    </button>
  );
}
