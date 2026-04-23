import path from "node:path";

import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const monorepoRoot = path.resolve(process.cwd(), "../..");
const internalApiBaseUrl = process.env.YOORA_INTERNAL_API_BASE_URL?.trim();

const imageRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "",
    pathname: "/**",
  },
];

if (internalApiBaseUrl) {
  try {
    const internalApiUrl = new URL(internalApiBaseUrl);

    imageRemotePatterns.push({
      protocol: internalApiUrl.protocol.replace(":", "") as "http" | "https",
      hostname: internalApiUrl.hostname,
      port: internalApiUrl.port,
      pathname: "/**",
    });
  } catch {
    // Ignore invalid URLs so config stays bootable even if env is malformed.
  }
}

export default function nextConfig(phase: string): NextConfig {
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    distDir: isDevelopment ? ".next" : ".next-build",
    outputFileTracingRoot: monorepoRoot,
    images: {
      remotePatterns: imageRemotePatterns,
    },
  };
}
