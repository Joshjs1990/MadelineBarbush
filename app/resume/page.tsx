import Image from "next/image";

const quickFacts = [
  { value: "NYC", label: "Based in" },
  { value: "EN / ES", label: "Languages" },
  { value: "Film + theatre", label: "Mediums" },
];

export default function ResumePage() {
  return (
    <main className="resume-page">
      <section className="resume-hero">
        <div className="resume-hero-copy">
          <p className="eyebrow">Resume</p>
          <h1>Madeline<br />Barbush</h1>
          <p className="resume-role">Actor · Writer · New York City</p>
          <p className="resume-summary">A darkly comedic actor and storyteller working across film and theater.</p>
        </div>
        <div className="resume-portrait">
          <Image src="/images/maddie-resume.webp" alt="Madeline Barbush" fill sizes="(max-width: 700px) 100vw, 38vw" unoptimized />
          <span>Headshot / 01</span>
        </div>
      </section>

      <section className="resume-facts" aria-label="Quick facts">
        {quickFacts.map((fact) => (
          <div key={fact.label}><strong>{fact.value}</strong><span>{fact.label}</span></div>
        ))}
      </section>

      <section className="resume-grid">
        <div className="resume-column resume-column-main">
          <section className="resume-block" aria-labelledby="work-title">
            <p className="eyebrow">01 / Selected work</p>
            <h2 id="work-title">Film +<br />theater</h2>
            <div className="resume-entry">
              <div className="resume-entry-heading"><h3><em>Flapjax</em></h3><span>Upcoming feature film</span></div>
              <p><strong>Louie</strong> · Dir. Rocko Zevenbergen</p>
              <p>Punk rock sweetheart with a big heart.</p>
            </div>
            <div className="resume-entry">
              <div className="resume-entry-heading"><h3><em>AC</em></h3><span>Short film · in pre-production</span></div>
              <p><strong>Lead / Star</strong> · Spanish-language film</p>
              <p>Written for the screen and performed by Madeline Barbush.</p>
            </div>
          </section>

          <section className="resume-block resume-block-accent" aria-labelledby="practice-title">
            <p className="eyebrow">02 / Creative practice</p>
            <h2 id="practice-title">Writing +<br />making</h2>
            <p>Alongside acting, Madeline writes short films and plays to tell stories with other artists—and act some more, of course.</p>
            <p>Her work tends toward the dark and comedic, with a particular interest in characters who are complicated, surprising, and a little bit strange.</p>
          </section>
        </div>

        <div className="resume-column">
          <section className="resume-block" aria-labelledby="training-title">
            <p className="eyebrow">03 / Training</p>
            <h2 id="training-title">The work<br />behind the work.</h2>
            <div className="resume-list">
              <div><strong>The Actor&apos;s Center</strong><span>Mentorship Program for Emerging Artists · completed</span></div>
              <div><strong>Deborah Hedwall</strong><span>Ongoing acting studies · New York City</span></div>
              <div><strong>Playhouse West Philadelphia</strong><span>Meisner Technique</span></div>
              <div><strong>Ron VanLieu</strong><span>Acting studies</span></div>
            </div>
          </section>

          <section className="resume-block" aria-labelledby="education-title">
            <p className="eyebrow">04 / Education</p>
            <h2 id="education-title">Art,<br />cinema + life.</h2>
            <div className="resume-list">
              <div><strong>Temple University</strong><span>Art History and Cinema</span></div>
              <div><strong>Philadelphia Museum of Art</strong><span>Professional experience</span></div>
              <div><strong>Art museums in Madrid + Mexico City</strong><span>Professional experience</span></div>
            </div>
          </section>

          <section className="resume-details" aria-label="Additional details">
            <div><span>Origin</span><strong>PA</strong></div>
            <div><span>Base</span><strong>New York City</strong></div>
            <div><span>Languages</span><strong>English + Spanish</strong></div>
            <div><span>Also</span><strong>Solo travel, art, cinema</strong></div>
          </section>
        </div>
      </section>
    </main>
  );
}
