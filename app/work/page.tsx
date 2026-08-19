import type { Metadata } from "next";
import { getExternalMedia, getMediaPlacements } from "@/lib/site-settings/media";
import { mediaBucket, PREFIX, publicMediaUrl } from "@/lib/media/r2";
import { toYouTubeEmbedUrl } from "@/lib/media/youtube";

export const metadata: Metadata = {
  title: "Video",
  description: "Selected film clips featuring Madeline Barbush.",
};

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const videos = await getManagedVideos();
  return (
    <main className="video-page"><section className="simple-page-heading"><h1>Video</h1></section><section className="video-grid">{videos.length ? videos.map((video) => <Clip key={video.key} title={video.title} url={video.url} contentType={video.contentType} />) : <p className="video-empty">Add a video in the media library and check “Videos page” to display it here.</p>}</section>
    </main>
  );
}

type ManagedVideo = { key: string; title: string; url: string; contentType: string };

async function getManagedVideos(): Promise<ManagedVideo[]> {
  const [external, placements, bucket] = await Promise.all([getExternalMedia(), getMediaPlacements(), mediaBucket()]);
  const videos: ManagedVideo[] = external.filter((item) => item.placements.includes("videos-page")).map((item) => ({ key: `youtube:${item.id}`, title: item.title, url: item.url, contentType: item.contentType }));
  if (bucket) {
    const result = await bucket.list({ prefix: PREFIX });
    for (const item of result.objects) {
      if (!placements[item.key]?.includes("videos-page")) continue;
      const url = await publicMediaUrl(item.key);
      if (url) videos.push({ key: item.key, title: item.key.split("/").at(-1) ?? "Video", url, contentType: item.httpMetadata?.contentType ?? "video/mp4" });
    }
  }
  return videos;
}

function Clip({ title, url, contentType }: { title: string; url: string; contentType: string }) {
  const embedUrl = toYouTubeEmbedUrl(url);
  return <article className="video-clip"><div className="video-clip__player">{embedUrl ? <iframe src={embedUrl} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <video src={url} controls playsInline preload="metadata" />}</div><h2>{title}</h2><p>{contentType === "youtube" ? "YouTube" : "Film clip"}</p></article>;
}
