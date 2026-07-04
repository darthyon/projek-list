import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Static export emits HTML after the build — inject the app shell by hand.
  // Offline navigation falls back to "/" (see sw.ts); client router + Dexie do the rest.
  additionalPrecacheEntries: [{ url: "/", revision: `${Date.now()}` }],
});

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Serwist adds a webpack config; dev runs Turbopack (SW disabled in dev),
  // prod builds run `next build --webpack`. This silences the mismatch error.
  turbopack: {},
};

export default withSerwist(nextConfig);
