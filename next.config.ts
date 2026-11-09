import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // `qr-code-styling` ships optional Node renderers in its type surface.
    // The browser build never uses them, so stop webpack resolving `canvas`.
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
