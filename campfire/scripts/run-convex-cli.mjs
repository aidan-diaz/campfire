import util from "node:util";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

if (typeof util.styleText !== "function") {
  console.error(
    `[campfire] Convex CLI needs Node.js >= 20.12 (uses util.styleText). Current: ${process.version}.`,
  );
  console.error("  Fix: nvm install && nvm use   (see .nvmrc for Node 22)");
  process.exit(1);
}

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const cliBundle = path.join(root, "node_modules/convex/dist/cli.bundle.cjs");
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [cliBundle, ...args], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});

process.exit(result.status ?? 1);
