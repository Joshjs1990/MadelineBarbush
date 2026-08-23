import type { Metadata } from "next";
import Image from "next/image";
import { getExternalMedia, getMediaOrder, getMediaPlacements } from "@/lib/site-settings/media";
import { mediaBucket, PREFIX, publicMediaUrl } from "@/lib/media/r2";
import { toYouTubeEmbedUrl } from "@/lib/media/youtube";
import { MEDIA_PLAY_EVENT, YouTubeEmbed } from "@/components/media/YouTubeEmbed";

export const metadata: Metadata = {
  title: "Video",
  description: "Selected film clips featuring Madeline Barbush.",
};

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const media = await getManagedMedia();
  return (
    <main className="video-page"><section className="simple-page-heading"><h1>Video</h1></section><section className="video-grid">{media.length ? media.map((item) => <MediaItem key={item.key} title={item.title} url={item.url} contentType={item.contentType} />) : <p className="video-empty">Add a video in the media library and check “Videos page” to display it here.</p>}</section>
    </main>
  );
}

type ManagedMedia = { key: string; title: string; url: string; contentType: string };

async function getManagedMedia(): Promise<ManagedMedia[]> {
  const [external, order, placements, bucket] = await Promise.all([getExternalMedia(), getMediaOrder(), getMediaPlacements(), mediaBucket()]);
  const media: ManagedMedia[] = external
    .filter((item) => item.placements.includes("work-page") || item.placements.includes("videos-page"))
    .map((item) => ({ key: `youtube:${item.id}`, title: item.title, url: item.url, contentType: item.contentType }));
  if (bucket) {
    const result = await bucket.list({ prefix: PREFIX });
    for (const item of result.objects) {
      if (!placements[item.key]?.includes("work-page") && !placements[item.key]?.includes("videos-page")) continue;
      const url = await publicMediaUrl(item.key);
      if (url) media.push({ key: item.key, title: item.key.split("/").at(-1) ?? "Media", url, contentType: item.httpMetadata?.contentType ?? "application/octet-stream" });
    }
  }
  const orderIndex = new Map(order.map((key, index) => [key, index]));
  return media.sort((a, b) => (orderIndex.get(a.key) ?? Number.MAX_SAFE_INTEGER) - (orderIndex.get(b.key) ?? Number.MAX_SAFE_INTEGER));
}

function MediaItem({ title, url, contentType }: { title: string; url: string; contentType: string }) {
  const embedUrl = toYouTubeEmbedUrl(url);
  const isImage = contentType.startsWith("image/");
  const isYouTube = contentType === "youtube";
  return <article className="video-clip"><div className="video-clip__player">{isImage ? <Image src={url} alt={title} fill sizes="(max-width: 700px) 100vw, 50vw" unoptimized /> : isYouTube && embedUrl ? <YouTubeEmbed embedUrl={embedUrl} title={title} url={url} /> : <video src={url} controls playsInline preload="metadata" onPlay={(event) => { window.dispatchEvent(new Event(MEDIA_PLAY_EVENT)); document.querySelectorAll("video").forEach((video) => { if (video !== event.currentTarget) video.pause(); }); }} />}</div><h2>{title}</h2>{isImage ? <p>Image</p> : isYouTube ? null : <p>Film clip</p>}</article>;
}
