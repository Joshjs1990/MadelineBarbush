/* eslint-disable @next/next/no-img-element */
import { getPhotoGallery } from "@/lib/site-settings/store";
export const dynamic = "force-dynamic";
export default async function PhotosPage() { const { images } = await getPhotoGallery(); return <main className="photos-page"><section className="section-hero"><p className="eyebrow">Photos</p><h1>Personal photographs,<br />performance stills.</h1><p>Personal photographs and selected performance stills.</p></section><section className="photo-grid">{images.map((src) => <figure key={src}><img src={src} alt="Madeline Barbush" /></figure>)}</section></main>; }
