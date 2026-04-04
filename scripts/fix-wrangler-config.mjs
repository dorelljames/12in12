/**
 * Post-build script to fix the generated wrangler.json for Cloudflare Pages compatibility.
 *
 * @astrojs/cloudflare 13.x generates a Workers-style wrangler.json that includes
 * fields incompatible with Pages (empty triggers, reserved ASSETS binding name).
 * This script patches those fields after the build.
 */
import { readFileSync, writeFileSync } from "node:fs";

const configPath = "dist/server/wrangler.json";
const config = JSON.parse(readFileSync(configPath, "utf-8"));

// Remove empty triggers — Pages expects { crons: [...] } if present
delete config.triggers;

// Rename reserved ASSETS binding for Pages
if (config.assets?.binding === "ASSETS") {
  config.assets.binding = "STATIC_ASSETS";
}

writeFileSync(configPath, JSON.stringify(config));
console.log("Fixed wrangler.json for Cloudflare Pages compatibility.");
