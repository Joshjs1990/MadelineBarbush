import Image from "next/image";
const images=[
  { src: "/images/actor-wide.jpg", width: 2048, height: 1358 },
  { src: "/images/actor-close.jpg", width: 1018, height: 1536 },
  { src: "/images/work/glasshouse-static.webp", width: 1672, height: 941 },
  { src: "/images/work/saints-service-door.webp", width: 1672, height: 941 },
  { src: "/images/work/platform-strangers.webp", width: 1672, height: 941 },
];
export default function PhotosPage() { return <main className="photos-page"><section className="section-hero"><p className="eyebrow">Photos</p><h1>Personal photographs,<br />performance stills.</h1><p>Personal photographs and selected performance stills.</p></section><section className="photo-grid">{images.map((image)=><figure key={image.src}><Image {...image} alt="Madeline Barbush" sizes="(max-width: 700px) 100vw, 50vw" unoptimized /></figure>)}</section></main>; }
