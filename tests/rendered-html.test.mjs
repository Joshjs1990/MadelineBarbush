import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const previewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;
const templateRoot = new URL("../", import.meta.url);

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
  assert.match(html, /After the Last Train/);
  assert.match(html, /src="\/images\/actor-wide\.jpg"/);
  assert.match(html, /src="\/images\/actor-close\.jpg"/);
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
  assert.equal(indexBody.data[0].slug, "after-the-last-train");

  const detailResponse = await render("/api/case-studies/after-the-last-train");
  assert.equal(detailResponse.status, 200);

  const detailBody = await detailResponse.json();
  assert.equal(detailBody.source, "case-study-store");
  assert.equal(detailBody.data.title, "After the Last Train");

  const missingResponse = await render("/api/case-studies/not-a-project");
  assert.equal(missingResponse.status, 404);
});

test("server-renders works archive, contact page and expanded case studies", async () => {
  const archiveResponse = await render("/work");
  assert.equal(archiveResponse.status, 200);
  const archiveHtml = await archiveResponse.text();
  assert.match(archiveHtml, /Projects are the front door\./);
  assert.match(archiveHtml, /Interactive works archive/);
  assert.match(archiveHtml, /Held tension, night movement/);

  const contactResponse = await render("/contact");
  assert.equal(contactResponse.status, 200);
  const contactHtml = await contactResponse.text();
  assert.match(contactHtml, /For roles, collaborations and representation enquiries\./);
  assert.match(contactHtml, /hello@example\.com/);
  assert.match(contactHtml, /Works archive/);

  const detailResponse = await render("/work/after-the-last-train");
  assert.equal(detailResponse.status, 200);
  const detailHtml = await detailResponse.text();
  assert.match(detailHtml, /Performance texture/);
  assert.match(detailHtml, /Terminal light, wet concrete, fluorescent quiet\./);
  assert.match(detailHtml, /The performance tracks panic without announcing it\./);

  const adminResponse = await render("/admin");
  assert.equal(adminResponse.status, 200);
  const adminHtml = await adminResponse.text();
  assert.match(adminHtml, /Case-study editor\./);
  assert.match(adminHtml, /Add credit field/);
  assert.match(adminHtml, /Add YouTube embed/);
});

test("keeps portfolio shell and Cloudflare prep wired", async () => {
  const [css, page, layout, packageJson, homeExperience, siteShell, projectIndex, hostingConfig] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../components/layout/HomeExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/layout/SiteShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/project-index/ProjectIndex.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "mbar-actor-portfolio"/);
  assert.match(page, /<HomeExperience projects=\{projects\} \/>/);
  assert.match(hostingConfig, /"d1": "DB"/);
  assert.match(layout, /<SiteShell>\{children\}<\/SiteShell>/);
  assert.match(homeExperience, /\/images\/actor-wide\.jpg/);
  assert.match(homeExperience, /Reel coming soon/);
  assert.match(siteShell, /<SmoothScroll \/>/);
  assert.match(projectIndex, /from "next\/link"/);
  assert.match(css, /\.crt-overlay/);
  assert.doesNotMatch(css, /sites-skeleton|loading-skeleton|transition-overlay|is-transitioning/i);

  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
  await assert.rejects(access(new URL("components/motion/MotionProvider.tsx", templateRoot)));
  await assert.rejects(access(new URL("components/navigation/ProjectTransitionLink.tsx", templateRoot)));
  await assert.rejects(access(new URL("public/downloads/cv-placeholder.txt", templateRoot)));
  await assert.rejects(access(new URL("public/downloads/headshots-placeholder.txt", templateRoot)));
  await assert.rejects(access(new URL("public/images/actor-wide.png", templateRoot)));
  await assert.rejects(access(new URL("public/images/actor-close.png", templateRoot)));
});
