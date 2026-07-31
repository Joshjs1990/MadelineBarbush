type D1Env = {
  DB?: D1Database;
};

/**
 * Resolves the Cloudflare D1 binding, or null when it is unavailable.
 *
 * Returns null rather than throwing so read paths can fall back to seed content
 * during local development and on deploys without a database id.
 */
export async function getD1() {
  try {
    const runtime = (await import("cloudflare:workers")) as { env?: D1Env };
    return runtime.env?.DB ?? null;
  } catch {
    return null;
  }
}
