import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The monorepo root, not this directory: npm workspaces hoist dependencies
  // to ../node_modules, so Turbopack has to be able to see above frontend/.
  // Pinning it also stops Next walking up to a stray lockfile in $HOME.
  turbopack: { root: path.join(import.meta.dirname, "..") },

  // The backend workspace ships TypeScript source rather than a build step,
  // so Next compiles it as part of the app. Keeps one toolchain instead of
  // adding a separate tsc watch just to consume our own package.
  transpilePackages: ["@medisure/backend"],

  images: {
    // Uploaded media (doctor photos, achievements, gallery) is served from
    // Cloudinary in Phase 5; YouTube thumbnails back the video facade.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
