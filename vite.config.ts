import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const { d1, r2 } = hostingConfig;
const d1DatabaseName = process.env.CLOUDFLARE_D1_DATABASE_NAME ?? "site-creator-d1";
const d1DatabaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

/**
 * Application secrets forwarded into the local worker.
 *
 * `workerd` does not inherit the host shell's environment, so without this the
 * booking emails and the reminder endpoint cannot be exercised in development.
 * Only applied when serving — see below — so a build never bakes a secret into
 * the deployed worker's plain-text vars. In production these come from the
 * Cloudflare dashboard as real secrets and arrive on `env` the same way.
 */
const FORWARDED_SECRETS = ["RESEND_API_KEY", "BOOKING_FROM_EMAIL", "CRON_SECRET"];

function localVars() {
  return Object.fromEntries(
    FORWARDED_SECRETS.filter((name) => process.env[name]).map((name) => [
      name,
      process.env[name] as string,
    ]),
  );
}

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1 && d1DatabaseId
    ? [
        {
          binding: d1,
          database_name: d1DatabaseName,
          database_id: d1DatabaseId,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async ({ command }) => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config:
          command === "serve"
            ? { ...localBindingConfig, vars: localVars() }
            : localBindingConfig,
      }),
    ],
  };
});
