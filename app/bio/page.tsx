import Image from "next/image";

const stats = [
  { value: "NYC", label: "Based in" },
  { value: "EN / ES", label: "Languages" },
  { value: "Film + stage", label: "Working across" },
];

export default function BioPage() {
  return (
    <main className="bio-page">
      <section className="bio-intro" aria-labelledby="bio-intro-title">
        <div className="bio-portrait">
          <Image src="/images/maddie-bio.webp" alt="Madeline Barbush" fill sizes="(max-width: 700px) 100vw, 42vw" unoptimized />
          <span className="bio-image-label">Madeline Barbush / NYC</span>
        </div>
        <div className="bio-intro-copy">
          <p className="eyebrow">The short version</p>
          <h2 id="bio-intro-title">Hi, I&apos;m Maddie.</h2>
          <p className="bio-lede">I&apos;m an actor from PA, now living in NYC. I also write so I can tell stories with other artists—and act some more, of course.</p>
          <p>They&apos;re usually dark and comedic, like me.</p>
        </div>
      </section>

      <section className="bio-stats" aria-label="Quick facts">
        {stats.map((stat) => (
          <div className="bio-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="bio-story" aria-labelledby="bio-story-title">
        <div className="bio-story-heading">
          <p className="eyebrow">The long way around</p>
          <h2 id="bio-story-title">A winding route<br />to the stage.</h2>
        </div>
        <div className="bio-story-list">
          <article>
            <span className="bio-index">01</span>
            <div><h3>Art, cinema &amp; everywhere else</h3><p>I studied Art History and Cinema at Temple University, then went on to work at the Philadelphia Museum of Art and other art museums in Madrid and Mexico City. I speak Spanish and love to travel solo. I feel invincible when I can combine the two.</p></div>
          </article>
          <article>
            <span className="bio-index">02</span>
            <div><h3>Before I knew it</h3><p>I started acting in Madrid for filmmaker friends who knew I was an actor before I did. It ignited a passion within me that museum work never could. Surprise surprise.</p></div>
          </article>
          <article>
            <span className="bio-index">03</span>
            <div><h3>Training, always</h3><p>I trained in the Meisner Technique at Playhouse West Philadelphia, where I began to write and make short films and plays. I moved to NYC to begin working as an actor, while continuing my studies with Deborah Hedwall.</p><p>I just completed the Mentorship Program for Emerging Artists at The Actor&apos;s Center. Among many others, I studied with Ron VanLieu, who is an absolute and actual legend.</p></div>
          </article>
        </div>
      </section>

      <section className="bio-current" aria-labelledby="bio-current-title">
        <div>
          <p className="eyebrow">Now showing</p>
          <h2 id="bio-current-title">On screen.<br />On stage.<br />In progress.</h2>
        </div>
        <div className="bio-current-copy">
          <p>I work in both film and theater.</p>
          <p>I am in the upcoming feature, <em>Flapjax</em> (Dir. Rocko Zevenbergen), playing the punk rock sweetheart, Louie.</p>
          <p>I am beginning pre-production for my short film, <em>AC</em>, in which I will star. It&apos;s entirely in Spanish, so start studying, bebe.</p>
        </div>
      </section>
    </main>
  );
}
