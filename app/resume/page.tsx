import Image from "next/image";
import { getEditableContent } from "@/lib/assistant/store";

export const dynamic = "force-dynamic";

const theater = [
  ["The Midnight Chapters", "Kim / Quinn", "A.R.T. / New York Theatres"], ["Royal Oak", "Autumn", "Soho Playhouse"], ["Say Gay", "Jace", "Blank Page Theatre Company"], ["This Grass Kills People", "Oren", "Blank Page Theatre Company"], ["Our Lady of 121st Street", "Marcia", "Open Hydrant Theater"], ["Gingham Dog", "Barbara", "Playhouse West"], ["In Arabia We’d All Be Kings", "Chickie", "Open Hydrant Theater"], ["All in a Day’s Work", "Fran / Donna / Marci / Angie", "Playhouse West"],
];
const film = [
  ["I Fell in Love with a Z-Grade Director in Brooklyn", "Supporting", "Feature · Dir. Kenichi Ugana"], ["Flapjax", "Supporting", "Feature · Dir. Rocko Zevenbergen"], ["Eleanor Slaughter", "Supporting", "Feature · Dir. Chris Chan Roberson"], ["Gilly and Keeves", "Supporting", "YouTube Series · Dir. McKeever"], ["The Redemption of Donna Asher", "Supporting", "Animated Feature · Dir. Steven Adams"], ["Dig a Pony", "Lead", "Feature · Dir. Demi Lashaw"], ["Prom Night", "Lead", "Short · Brooklyn College Thesis"], ["Manfreed", "Supporting", "Feature · Dir. Will Rittweger"], ["About James", "Supporting", "Short · Alice Weber"], ["Juniper", "Supporting", "Short · Dir. Pratigya Paudel"], ["Made", "Lead", "Short · Dir. Ian Mosley-Duffy"],
];
const training = [["The Actors Center", "Mentorship Program for Emerging Artists · 2025–2026"], ["Playhouse West Philadelphia", "Meisner Technique · Artistic Director Tony Savant · July 2020–October 2022"], ["Deborah Hedwall", "Scene Study · Uta Hagen, Stella Adler, Meisner Technique"], ["Karen Braga", "Alexander Technique"]];

function Credits({ items }: { items: string[][] }) { return <div className="resume-simple-list">{items.map(([title, role, detail]) => <div key={title}><strong>{title}</strong><span>{role}</span><small>{detail}</small></div>)}</div>; }

export default async function ResumePage() {
  const content = await getEditableContent();
  return (
    <main className="resume-page resume-page-simple">
      <section className="resume-simple-intro">
        <section className="simple-page-heading"><h1>Resume</h1><p>Madeline Grace Barbush · Actor · Writer · New York City</p><p><a href={`mailto:${content.contact.email}`}>{content.contact.email}</a> · {content.contact.phone} · Equity · 5&apos;5&quot;</p><a className="resume-download" href="/downloads/resume.pdf" download>Download resume PDF</a></section>
        <section className="resume-simple-photo"><Image src="/images/maddie-resume.webp" alt="Madeline Barbush" fill sizes="(max-width: 700px) 100vw, 22rem" unoptimized /></section>
      </section>
      <section className="resume-simple-grid">
        <section><h2>Theater</h2><Credits items={theater} /><h2>Staged readings</h2><div className="resume-simple-list"><div><strong>In the Dark</strong><small>J · Ensemble Studio Theatre / Drew University</small></div><div><strong>The Hideous Progeny</strong><small>Mary Godwin · Ensemble Studio Theatre / Drew University</small></div></div></section>
        <section><h2>Film + screen</h2><Credits items={film} /><h2>Training</h2><div className="resume-simple-list">{training.map(([name, detail]) => <div key={name}><strong>{name}</strong><small>{detail}</small></div>)}</div><h2>Special skills</h2><p>Screenwriter · fluent in Spanish · dialects and languages · improvisation · tumbling · basketball · swimming · running · yoga · biking · U.S. passport · NY State Driver&apos;s License</p></section>
      </section>
    </main>
  );
}
