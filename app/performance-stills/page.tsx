/* eslint-disable @next/next/no-img-element */
import { getMediaMetadata } from "@/lib/site-settings/media";
import { getPhotoGallery } from "@/lib/site-settings/store";

export const dynamic = "force-dynamic";

function mediaKeyFromUrl(url: string) {
  try {
    const path = new URL(url, "https://media.local").pathname;
    const index = path.indexOf("/uploads/");
    return index >= 0 ? decodeURIComponent(path.slice(index + 1)) : "";
  } catch {
    return "";
  }
}

export default async function PerformanceStillsPage() {
  const [{ images }, metadata] = await Promise.all([getPhotoGallery(), getMediaMetadata()]);
  return <main className="photos-page"><section className="simple-page-heading"><h1>Performance Stills</h1></section><section className="photo-grid">{images.map((src) => { const key = mediaKeyFromUrl(src); const title = metadata[key] ?? key.split("/").at(-1) ?? "Performance still"; return <figure key={src}><img src={src} alt={title} /><figcaption>{title}</figcaption></figure>; })}</section></main>;
}
