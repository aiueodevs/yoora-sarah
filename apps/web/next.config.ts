import path from 'node:path';
import type { NextConfig } from 'next';

const workspaceRoot = path.resolve(__dirname, '..', '..');

const nextConfig: NextConfig = {
  transpilePackages: ['@yoora/ui', '@yoora/database'],
  turbopack: {
    root: workspaceRoot,
  },

  outputFileTracingRoot: workspaceRoot,
  images: {
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'yoorasarah-products.fly.storage.tigris.dev',
      },
      {
        protocol: 'https',
        hostname: 'image.mux.com',
      },
      {
        protocol: 'https',
        hostname: 'www.yoorasarah.com',
      },
    ],
  },
};

export default nextConfig;
