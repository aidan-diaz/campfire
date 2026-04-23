import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the app root: without this, a lockfile in a parent (e.g. $HOME) makes
  // Next/Turbopack resolve the wrong workspace and fail on the wrong tree.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
