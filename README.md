# Madeleline Barbush Actor Portfolio

A Cloudflare Worker-ready actor portfolio running on
[vinext](https://github.com/cloudflare/vinext), with Cloudflare D1 and Drizzle
support for editable case-study content.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This project does not use `wrangler.jsonc`.

## Included Shape

- edit site code under `app/`
- `.openai/hosting.json` declares the Sites D1 binding
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` defines the case-study table
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed
- `app/api/case-studies` exposes the current case-study data as a backend-ready API
- `app/api/case-studies/[slug]` exposes an individual case study
- `app/admin` provides the signed-in case-study editor
- `app/api/admin/*` serves the editor and account management, guarded by session
- `lib/auth/` holds password hashing, the D1 user and session store, and the guards

## Admin Area

`/admin` is a signed-in editor for the case studies. It needs the D1 binding —
without it the page says so and the site keeps serving the seed content.

### First sign-in

Visit `/admin` on a fresh database and it redirects to `/admin/setup`, which
creates the first administrator and signs it in. Once any account exists that
page is closed off, and the matching API route enforces the same condition, so
it cannot be replayed later to mint a second admin.

### What editors can do

- Edit, hide or show every case study, including the built-in ones in
  `data/projects.ts`. Editing a built-in entry writes a D1 row that overrides it;
  deleting that row reverts to the built-in version rather than removing the work.
- Add new case studies, and delete ones that only exist in D1.
- Hidden entries disappear from the homepage, the archive and the public API, and
  their `/work/<slug>` page returns 404.
- Edit the homepage showreel at `/admin/showreel`: paste a YouTube link to swap
  the holding frame for the player, or clear it to go back to the placeholder and
  edit its label, headline and background image. Settings live in a `site_settings`
  key/value table, and the homepage falls back to `SHOWREEL_DEFAULTS` without D1.

Every admin page carries a **Back to site** link in the top bar.

### Roles

- **Editor** — manages case studies.
- **Admin** — also manages accounts at `/admin/users`: add users, switch roles,
  disable, delete and set passwords. There is no invitation email; passwords are
  set in the form and shared directly. Everyone can change their own password at
  `/admin/account`.

Actions that would leave the site with no active administrator are refused, and
disabling an account or changing a password revokes its sessions immediately.

### How the login works

Passwords are hashed with PBKDF2-SHA256 through WebCrypto, which is native on
Workers. Sessions are opaque random tokens in an `HttpOnly` cookie, stored only
as a SHA-256 hash, so the database row stays authoritative and signing out takes
effect at once. No `AUTH_SECRET` or other environment variable is needed.

Each page and each route handler checks the session independently — a route
handler is directly callable, so the UI never doubles as the access control.

## Cloudflare Worker Readiness

This project is already structured for Cloudflare Worker deployment through
Vinext:

- `worker/index.ts` is the Worker entry point.
- `npm run build` emits the Worker-compatible production bundle.
- `.openai/hosting.json` stores the logical D1 binding name, `DB`.

The case-study API reads from D1 when database records exist and falls back to
the seed data in `data/projects.ts` when the database is empty or unavailable.
Run `npm run db:generate` after schema changes and keep the generated SQL in
`drizzle/`.

For production writes from `/admin`, create a D1 database in the Cloudflare
account and set `CLOUDFLARE_D1_DATABASE_ID` in the build environment. Optional:
set `CLOUDFLARE_D1_DATABASE_NAME` if the database is not named
`site-creator-d1`. Without a real database id, the app deploys without the D1
binding and keeps using seed case-study data.

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the app and verify rendered portfolio/API smoke checks
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
