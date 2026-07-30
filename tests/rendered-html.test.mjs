import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { mergeCaseStudyLists } from "../lib/case-studies/merge.ts";

const previewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;
const templateRoot = new URL("../", import.meta.url);

const savedCaseStudy = {
  title: "TheCoolMoon",
  slug: "thecoolmoon",
  year: "2026",
  type: "Television",
  role: "Lead",
  productionCompany: "TCMProduction",
  intro: "Saved D1 entry.",
  description: "Saved D1 description.",
  archiveNote: "Saved D1 archive note.",
  longDescription: ["Saved D1 long description."],
  performanceNotes: ["Saved D1 performance note."],
  atmosphere: "Saved D1 atmosphere.",
  heroImage: "https://example.com/image.jpg",
  gallery: [{ src: "https://example.com/image.jpg", alt: "Saved image.", orientation: "landscape" }],
  videoEmbeds: [{ title: "Showreel", url: "https://www.youtube.com/watch?v=RlsxnU3LCis" }],
  credits: [{ label: "Role", value: "Lead" }],
  pullQuote: "Saved D1 pull quote.",
  accentColor: "#737373",
  textColor: "#ffffff",
  relatedProjectSlug: "glasshouse-static",
  featured: false,
  order: 7,
};

test("keeps seed examples visible alongside D1 admin entries", () => {
  const seedCaseStudies = [
    { ...savedCaseStudy, title: "Glasshouse Static", slug: "glasshouse-static", order: 1 },
    { ...savedCaseStudy, title: "Saints at the Service Door", slug: "saints-at-the-service-door", order: 2 },
    { ...savedCaseStudy, title: "Motel Blue Hour", slug: "motel-blue-hour", order: 3 },
    { ...savedCaseStudy, title: "Platform for Strangers", slug: "platform-for-strangers", order: 4 },
    { ...savedCaseStudy, title: "White Noise Rehearsal", slug: "white-noise-rehearsal", order: 5 },
  ];
  const merged = mergeCaseStudyLists(seedCaseStudies, [savedCaseStudy]);
  const slugs = merged.map((project) => project.slug);

  assert.equal(merged.length, 6);
  assert.deepEqual(slugs.slice(0, 5), [
    "glasshouse-static",
    "saints-at-the-service-door",
    "motel-blue-hour",
    "platform-for-strangers",
    "white-noise-rehearsal",
  ]);
  assert.equal(slugs[5], "thecoolmoon");
});

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the actor portfolio homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.doesNotMatch(html, previewMeta);
  assert.match(html, /<title>Madeleline Barbush \| Selected Work(?: \| Madeleline Barbush)?<\/title>/i);
  assert.match(html, /Madeleline Barbush/);
  assert.match(html, /Actor/);
  assert.match(html, /Reel coming soon/);
  assert.match(html, /Glasshouse Static/);
  assert.match(html, /src="\/images\/actor-wide\.jpg"/);
  assert.match(html, /src="\/images\/work\/glasshouse-static\.webp"/);
  assert.doesNotMatch(html, /\/_vinext\/image/);
  assert.doesNotMatch(html, /Placeholder|Your site is taking shape|react-loading-skeleton|sites-skeleton/i);
});

test("exposes case-study data through worker API routes", async () => {
  const indexResponse = await render("/api/case-studies");
  assert.equal(indexResponse.status, 200);
  assert.match(indexResponse.headers.get("content-type") ?? "", /^application\/json\b/i);

  const indexBody = await indexResponse.json();
  assert.equal(indexBody.source, "case-study-store");
  assert.ok(Array.isArray(indexBody.data));
  assert.equal(indexBody.data.length, 5);
  assert.equal(indexBody.data[0].slug, "glasshouse-static");

  const detailResponse = await render("/api/case-studies/glasshouse-static");
  assert.equal(detailResponse.status, 200);

  const detailBody = await detailResponse.json();
  assert.equal(detailBody.source, "case-study-store");
  assert.equal(detailBody.data.title, "Glasshouse Static");

  const missingResponse = await render("/api/case-studies/not-a-project");
  assert.equal(missingResponse.status, 404);
});

test("server-renders works archive, contact page and expanded case studies", async () => {
  const archiveResponse = await render("/work");
  assert.equal(archiveResponse.status, 200);
  const archiveHtml = await archiveResponse.text();
  assert.match(archiveHtml, /My work\./);
  assert.match(archiveHtml, /Interactive works archive/);
  assert.match(archiveHtml, /surveillance tension/);
  assert.doesNotMatch(archiveHtml, /textures/i);

  const contactResponse = await render("/contact");
  assert.equal(contactResponse.status, 200);
  const contactHtml = await contactResponse.text();
  assert.match(contactHtml, /For roles, collaborations and representation enquiries\./);
  assert.match(contactHtml, /hello@example\.com/);
  assert.match(contactHtml, /Works archive/);

  const detailResponse = await render("/work/glasshouse-static");
  assert.equal(detailResponse.status, 200);
  const detailHtml = await detailResponse.text();
  assert.match(detailHtml, /Project notes/);
  assert.match(detailHtml, /Rain glass, amber spill, corridor silence\./);
  assert.match(detailHtml, /Uses stillness as a way to make the frame feel watched\./);

  const videoResponse = await render("/work/motel-blue-hour");
  assert.equal(videoResponse.status, 200);
  const videoHtml = await videoResponse.text();
  assert.match(videoHtml, /youtube\.com\/embed/);
  assert.doesNotMatch(videoHtml, /Embedded material|<p class="eyebrow">Video<\/p>/);

  const adminResponse = await render("/admin");
  assert.equal(adminResponse.status, 200);
  const adminHtml = await adminResponse.text();
  assert.match(adminHtml, /Case-study editor\./);
  assert.match(adminHtml, /Add credit field/);
  assert.match(adminHtml, /Image URL/);
  assert.match(adminHtml, /Remove image/);
  assert.match(adminHtml, /Video title/);
  assert.match(adminHtml, /YouTube URL/);
  assert.match(adminHtml, /Remove video/);
  assert.match(adminHtml, /Add YouTube embed/);
});

test("keeps portfolio shell and Cloudflare prep wired", async () => {
  const [css, page, layout, packageJson, homeExperience, siteShell, projectIndex, hostingConfig, viteConfig] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../components/layout/HomeExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/layout/SiteShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/project-index/ProjectIndex.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "mbar-actor-portfolio"/);
  assert.match(page, /<HomeExperience projects=\{projects\} \/>/);
  assert.match(hostingConfig, /"d1": "DB"/);
  assert.match(viteConfig, /CLOUDFLARE_D1_DATABASE_ID/);
  assert.doesNotMatch(viteConfig, /00000000-0000-4000-8000-000000000000/);
  assert.match(layout, /<SiteShell>\{children\}<\/SiteShell>/);
  assert.match(homeExperience, /\/images\/actor-wide\.jpg/);
  assert.match(homeExperience, /Reel coming soon/);
  assert.match(siteShell, /<SmoothScroll \/>/);
  assert.match(projectIndex, /from "next\/link"/);
  assert.match(css, /\.crt-overlay/);
  assert.match(css, /fractalNoise/);
  assert.match(css, /id='paper'|id=%27paper%27|id%3D'paper'/);
  assert.doesNotMatch(css, /baseFrequency='0\.82'|baseFrequency=%270\.82%27|baseFrequency%3D'0\.82'/);
  assert.doesNotMatch(css, /repeating-linear-gradient/);
  assert.doesNotMatch(css, /sites-skeleton|loading-skeleton|transition-overlay|is-transitioning/i);

  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
  await assert.rejects(access(new URL("components/motion/MotionProvider.tsx", templateRoot)));
  await assert.rejects(access(new URL("components/navigation/ProjectTransitionLink.tsx", templateRoot)));
  await assert.rejects(access(new URL("public/downloads/cv-placeholder.txt", templateRoot)));
  await assert.rejects(access(new URL("public/downloads/headshots-placeholder.txt", templateRoot)));
  await assert.rejects(access(new URL("public/images/actor-wide.png", templateRoot)));
  await assert.rejects(access(new URL("public/images/actor-close.png", templateRoot)));
});
