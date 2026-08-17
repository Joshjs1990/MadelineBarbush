import Image from "next/image";

const theater = [
  ["The Midnight Chapters", "Kim / Quinn", "A.R.T. / New York Theatres"],
  ["Royal Oak", "Autumn", "Soho Playhouse"],
  ["Say Gay", "Jace", "Blank Page Theatre Company"],
  ["This Grass Kills People", "Oren", "Blank Page Theatre Company"],
  ["Our Lady of 121st Street", "Marcia", "Open Hydrant Theater"],
  ["Gingham Dog", "Barbara", "Playhouse West"],
  ["In Arabia We’d All Be Kings", "Chickie", "Open Hydrant Theater"],
  ["All in a Day’s Work", "Fran / Donna / Marci / Angie", "Playhouse West"],
];

const film = [
  ["I Fell in Love with a Z-Grade Director in Brooklyn", "Supporting", "Feature · Dir. Kenichi Ugana"],
  ["Flapjax", "Supporting", "Feature · Dir. Rocko Zevenbergen"],
  ["Eleanor Slaughter", "Supporting", "Feature · Dir. Chris Chan Roberson"],
  ["Gilly and Keeves", "Supporting", "YouTube Series · Dir. McKeever"],
  ["The Redemption of Donna Asher", "Supporting", "Animated Feature · Dir. Steven Adams"],
  ["Dig a Pony", "Lead", "Feature · Dir. Demi Lashaw"],
  ["Prom Night", "Lead", "Short · Brooklyn College Thesis"],
  ["Manfreed", "Supporting", "Feature · Dir. Will Rittweger"],
  ["About James", "Supporting", "Short · Dir. Alice Weber"],
  ["Juniper", "Supporting", "Short · Dir. Pratigya Paudel"],
  ["Made", "Lead", "Short · Dir. Ian Mosley-Duffy"],
];

const training = [
  ["The Actors Center", "Mentorship Program for Emerging Artists · 2025–2026"],
  ["Playhouse West Philadelphia", "Meisner Technique · Artistic Director Tony Savant · July 2020–October 2022"],
  ["Deborah Hedwall", "Scene Study · Uta Hagen, Stella Adler, Meisner Technique"],
  ["Karen Braga", "Alexander Technique"],
];

function Credits({ items }: { items: string[][] }) {
  return <div className="resume-credits">{items.map(([title, role, detail]) => <div className="resume-credit" key={`${title}-${role}`}><strong>{title}</strong><span>{role}</span><small>{detail}</small></div>)}</div>;
}

export default function ResumePage() {
  return (
    <main className="resume-page">
      <section className="resume-hero">
        <div className="resume-hero-copy">
          <p className="eyebrow">Actor resume</p>
          <h1>Madeline Grace<br />Barbush</h1>
          <p className="resume-role">Actor · Writer · New York City</p>
          <p className="resume-contact-line"><a href="mailto:Madeline.Barbush@gmail.com">Madeline.Barbush@gmail.com</a> · <a href="tel:+17173177861">(717) 317-7861</a></p>
          <p className="resume-contact-line">Equity · 5&apos;5&quot; · <a href="https://madelinebarbush.com">madelinebarbush.com</a></p>
        </div>
        <div className="resume-portrait">
          <Image src="/images/maddie-resume.webp" alt="Madeline Barbush" fill sizes="(max-width: 700px) 100vw, 38vw" unoptimized />
          <span>Headshot / 01</span>
        </div>
      </section>

      <section className="resume-facts" aria-label="Quick facts">
        <div><strong>5&apos;5&quot;</strong><span>Height</span></div>
        <div><strong>Equity</strong><span>Union</span></div>
        <div><strong>EN / ES</strong><span>Languages</span></div>
      </section>

      <section className="resume-grid">
        <div className="resume-column resume-column-main">
          <section className="resume-block" aria-labelledby="theater-title">
            <p className="eyebrow">01 / Theater</p>
            <h2 id="theater-title">Theater</h2>
            <Credits items={theater} />
          </section>
          <section className="resume-block resume-block-accent" aria-labelledby="readings-title">
            <p className="eyebrow">02 / Staged reading</p>
            <h2 id="readings-title">Staged<br />readings</h2>
            <div className="resume-reading"><strong>In the Dark</strong><span>J · Ensemble Studio Theatre / Drew University</span></div>
            <div className="resume-reading"><strong>The Hideous Progeny</strong><span>Mary Godwin · Ensemble Studio Theatre / Drew University</span></div>
          </section>
        </div>

        <div className="resume-column">
          <section className="resume-block" aria-labelledby="film-title">
            <p className="eyebrow">03 / Film</p>
            <h2 id="film-title">Film +<br />screen</h2>
            <Credits items={film} />
          </section>
          <section className="resume-block" aria-labelledby="training-title">
            <p className="eyebrow">04 / Training</p>
            <h2 id="training-title">Training</h2>
            <div className="resume-list">{training.map(([name, detail]) => <div key={name}><strong>{name}</strong><span>{detail}</span></div>)}</div>
            <p className="resume-mentors"><strong>Additional mentors:</strong> Ron Van Lieu, Welker White, Damian Young, Fay Simpson, Blake Hackler, Erica Fae, Arturo Luis Soria, Kathleen McNenny, Antoinette LaVecchia, Yura Kordonsky, Nancy Lemanger, Ken Barnett, Justine Wolf Williams.</p>
          </section>
          <section className="resume-block resume-skills" aria-labelledby="skills-title">
            <p className="eyebrow">05 / Special skills</p>
            <h2 id="skills-title">Special<br />skills</h2>
            <p>Screenwriter · fluent in Spanish · quick with dialects and languages · improvisation · basic tumbling · basketball · swimming · running · yoga · biking · U.S. passport · NY State Driver&apos;s License</p>
          </section>
        </div>
      </section>

      <section className="resume-agent"><span>Commercial Agent</span><strong>Tracey Goldblum (BBR)</strong><a href="mailto:tgoldblum@bbrtalent.com">tgoldblum@bbrtalent.com</a></section>
    </main>
  );
}
