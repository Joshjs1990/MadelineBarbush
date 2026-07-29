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
  assert.doesNotMatch(html, /Placeholder|Your site is taking shape|react-loading-skeleton|sites-skeleton/i);
});

test("exposes case-study data through worker API routes", async () => {
  const indexResponse = await render("/api/case-studies");
  assert.equal(indexResponse.status, 200);
  assert.match(indexResponse.headers.get("content-type") ?? "", /^application\/json\b/i);

  const indexBody = await indexResponse.json();
  assert.equal(indexBody.source, "local");
  assert.ok(Array.isArray(indexBody.data));
  assert.equal(indexBody.data[0].slug, "after-the-last-train");

  const detailResponse = await render("/api/case-studies/after-the-last-train");
  assert.equal(detailResponse.status, 200);

  const detailBody = await detailResponse.json();
  assert.equal(detailBody.source, "local");
  assert.equal(detailBody.data.title, "After the Last Train");

  const missingResponse = await render("/api/case-studies/not-a-project");
  assert.equal(missingResponse.status, 404);
});

test("keeps portfolio shell and Cloudflare prep wired", async () => {
  const [css, page, layout, packageJson, homeExperience, motionProvider] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../components/layout/HomeExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/motion/MotionProvider.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "mbar-actor-portfolio"/);
  assert.match(page, /<HomeExperience \/>/);
  assert.match(layout, /<SiteShell>\{children\}<\/SiteShell>/);
  assert.match(homeExperience, /\/images\/actor-wide\.png/);
  assert.match(homeExperience, /Reel coming soon/);
  assert.match(motionProvider, /transition-overlay__panel/);
  assert.match(motionProvider, /force-scroll-top/);
  assert.match(css, /\.crt-overlay/);
  assert.doesNotMatch(css, /sites-skeleton|loading-skeleton/i);

  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
  await assert.rejects(access(new URL("public/downloads/cv-placeholder.txt", templateRoot)));
  await assert.rejects(access(new URL("public/downloads/headshots-placeholder.txt", templateRoot)));
});
