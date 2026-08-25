import Image from "next/image";
import { getEditableContent } from "@/lib/assistant/store";

export const dynamic = "force-dynamic";

export default async function BioPage() {
  const content = await getEditableContent();
  return (
    <main className="bio-page bio-page-simple">
      <section className="simple-page-heading"><h1>{content.about.heading}</h1></section>
      <section className="bio-simple-content">
        <div className="bio-simple-portrait"><Image src="/images/maddie-bio.webp" alt="Madeline Barbush" fill sizes="(max-width: 700px) 100vw, 34vw" unoptimized /></div>
        <div className="bio-simple-copy">
          <p>{content.about.intro}</p>
          <p>I studied Art History and Cinema at Temple University. I went on to work at the Philadelphia Museum of Art and other art museums in Madrid &amp; Mexico City. I speak Spanish and love to travel solo. I feel invincible when I can combine the two.</p>
          <p>I started acting in Madrid for filmmaker friends who knew I was an actor before I did. It ignited a passion within me that museum work never could. Surprise surprise.</p>
          <p>I have trained in the Meisner Technique at Playhouse West Philadelphia, where I began to write and make short films and plays. I moved to NYC to begin working as an actor, while continuing my studies with Deborah Hedwall. I just completed the Mentorship Program for Emerging Artists at The Actor&apos;s Center. Among many others, I studied with Ron VanLieu who is an absolute and actual legend.</p>
          <p>I work in both film and theater. I am in the upcoming feature, <em>Flapjax</em> (Dir. Rocko Zevenbergen), playing the punk rock sweetheart, Louie. I am beginning pre-production for my short film, <em>AC</em>, in which I will star.</p>
        </div>
      </section>
    </main>
  );
}
