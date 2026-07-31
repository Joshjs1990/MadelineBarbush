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

async function render(pathname = "/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html", ...init.headers },
      ...init,
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
  assert.match(archiveHtml, /archive-hover-preview/);
  assert.doesNotMatch(archiveHtml, /archive-preview-pane/);
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

  // The test worker runs without the D1 binding, so accounts cannot be read and
  // the admin area reports that instead of rendering the editor to anyone.
  const adminResponse = await render("/admin");
  assert.equal(adminResponse.status, 200);
  const adminHtml = await adminResponse.text();
  assert.match(adminHtml, /Database not connected\./);
  assert.match(adminHtml, /noindex/);
  assert.doesNotMatch(adminHtml, /Add credit field/);
  assert.doesNotMatch(adminHtml, /Add YouTube embed/);
});

test("keeps the admin area and its API behind a session", async () => {
  for (const pathname of [
    "/api/admin/case-studies",
    "/api/admin/users",
    "/api/admin/case-studies/glasshouse-static",
  ]) {
    const response = await render(pathname);
    assert.equal(response.status, 401, `${pathname} should require a session`);
  }

  const write = await render("/api/admin/case-studies/glasshouse-static", {
    method: "DELETE",
  });
  assert.equal(write.status, 401);

  const [editor, list, guard, robots] = await Promise.all([
    readFile(new URL("../components/admin/CaseStudyEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/CaseStudyList.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/auth/guard.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/robots.ts", import.meta.url), "utf8"),
  ]);

  // The editor still carries the repeater fields the case studies depend on.
  for (const field of [
    /Add credit field/,
    /Image URL/,
    /Remove image/,
    /Video title/,
    /YouTube URL/,
    /Add YouTube embed/,
  ]) {
    assert.match(editor, field);
  }

  assert.match(list, /method: "DELETE"/);
  assert.match(list, /hidden: !entry\.hidden/);
  assert.match(guard, /redirect\(total === 0 \? "\/admin\/setup" : "\/admin\/login"\)/);
  assert.match(robots, /disallow: \["\/admin", "\/api\/admin"\]/);

  const showreelWrite = await render("/api/admin/showreel", { method: "PUT" });
  assert.equal(showreelWrite.status, 401);
});

test("renders the editable showreel and the swipe transition", async () => {
  const [css, home, transition, shell, adminBar] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../components/layout/HomeExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/motion/PageTransition.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/layout/SiteShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/AdminBar.tsx", import.meta.url), "utf8"),
  ]);

  // Without D1 the homepage falls back to the default showreel rather than failing.
  const html = await (await render("/")).text();
  assert.match(html, /Reel coming soon/);
  assert.match(html, /reel-frame__label/);

  assert.match(home, /toYouTubeEmbedUrl/);
  assert.match(home, /showreel = SHOWREEL_DEFAULTS/);
  // The showreel type must stay clear of the D1 store, or the client bundle
  // would try to pull `cloudflare:workers` into the browser.
  assert.match(home, /from "@\/lib\/site-settings\/showreel"/);
  assert.doesNotMatch(home, /site-settings\/store/);

  assert.match(shell, /<PageTransition \/>/);
  assert.match(transition, /usePathname/);
  assert.match(transition, /prefers-reduced-motion: reduce/);
  assert.match(css, /@keyframes page-swipe/);
  assert.match(css, /translate3d\(-100%, 0, 0\)/);

  assert.match(adminBar, /Back to site/);
  assert.match(adminBar, /href: "\/admin\/showreel"/);

  // The footer reads dark with accent headings and white secondary text.
  assert.match(css, /\.site-footer \{[^}]*background: #000;/);
  assert.match(css, /\.site-footer h2 \{[^}]*color: var\(--acid\);/);
});

test("keeps portfolio shell and Cloudflare prep wired", async () => {
  const [css, page, layout, packageJson, homeExperience, showreelDefaults, siteShell, projectIndex, hostingConfig, viteConfig] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../components/layout/HomeExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/site-settings/showreel.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/layout/SiteShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/project-index/ProjectIndex.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "mbar-actor-portfolio"/);
  assert.match(page, /<HomeExperience projects=\{projects\} showreel=\{showreel\} \/>/);
  assert.match(hostingConfig, /"d1": "DB"/);
  assert.match(viteConfig, /CLOUDFLARE_D1_DATABASE_ID/);
  assert.doesNotMatch(viteConfig, /00000000-0000-4000-8000-000000000000/);
  assert.match(layout, /<SiteShell>\{children\}<\/SiteShell>/);
  assert.match(homeExperience, /\/images\/actor-wide\.jpg/);
  // The reel copy is now an editable default rather than markup.
  assert.match(showreelDefaults, /\/images\/actor-wide\.jpg/);
  assert.match(showreelDefaults, /Reel coming soon/);
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
