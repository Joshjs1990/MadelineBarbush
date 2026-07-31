/**
 * Shown when the D1 binding is missing.
 *
 * Accounts and case-study edits both live in D1, so without it there is nothing
 * to sign in to — this says so plainly rather than failing at the first query.
 */
export function AdminUnconfigured() {
  return (
    <main className="admin-page">
      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-title">Database not connected.</h1>
        <p>
          The admin area needs the Cloudflare D1 binding <code>DB</code>. Set{" "}
          <code>CLOUDFLARE_D1_DATABASE_ID</code> in the build environment and redeploy. Until then
          the site keeps serving the built-in case studies from <code>data/projects.ts</code>.
        </p>
      </section>
    </main>
  );
}
