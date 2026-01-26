import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly disable Turbopack
  turbopack: {},

  webpack: (config, { isServer }) => {
    // 🔑 IMPORTANT:
    // ShadowWire has Node-only imports (fs, crypto…) in non-browser paths.
    // We MUST neutralize them for the client bundle only.
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Required for ShadowWire WASM
    config.experiments = {
      ...(config.experiments ?? {}),
      asyncWebAssembly: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    return config;
  },
};

export default nextConfig;
