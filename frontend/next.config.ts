import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Anchor Turbopack to frontend/ — parent lockfiles otherwise break module paths
  turbopack: {
    root: frontendRoot,
  },
};

export default nextConfig;
