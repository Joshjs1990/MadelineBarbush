import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Video",
  description: "Selected film clips featuring Madeline Barbush.",
};

export const dynamic = "force-dynamic";

export default function WorksPage() {
  return (
    <main className="video-page"><section className="section-hero"><p className="eyebrow">Video</p><h1>Selected clips.</h1><p>Film work, gathered as individual moments.</p></section><section className="video-grid"><Clip title="MADE" image="/images/work/motel-blue-hour.webp" /><Clip title="I Fell in Love" image="/images/work/platform-strangers.webp" /><Clip title="Prom Night" image="/images/work/saints-service-door.webp" /></section>
    </main>
  );
}
function Clip({ title, image }: { title: string; image: string }) { return <article className="video-clip"><div><Image src={image} alt="" fill sizes="33vw" unoptimized /></div><h2>{title}</h2><p>Film clip</p></article>; }
