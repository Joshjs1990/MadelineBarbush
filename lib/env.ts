/**
 * Runtime configuration lookup.
 *
 * On Cloudflare, secrets arrive on the worker `env` object rather than
 * `process.env`, so this checks the binding first and falls back to
 * `process.env` for local development and tests.
 */
export async function getEnvValue(name: string): Promise<string | null> {
  try {
    const runtime = (await import("cloudflare:workers")) as {
      env?: Record<string, unknown>;
    };
    const value = runtime.env?.[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  } catch {
    // Not running on the Cloudflare runtime — fall through.
  }

  const fallback = process.env?.[name];
  return typeof fallback === "string" && fallback.trim() ? fallback.trim() : null;
}
