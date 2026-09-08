import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // This app is its own workspace root — stops Turbopack from inferring the
  // repo root (it picks whichever lockfile it finds first up the tree).
  turbopack: {
    root: __dirname,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    // Page content (avatars, logos) is user-provided — any https host is allowed.
    // The Vercel Image CDN then optimizes/converts them per device.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/avif', 'image/webp'],
  },
};

export default withNextIntl(nextConfig);
