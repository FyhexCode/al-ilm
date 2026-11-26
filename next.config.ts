import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.2.18"],
  // Native PNG renderer used by the /og route — must not be bundled.
  serverExternalPackages: ["@resvg/resvg-js"],
  // The /og route reads the Arabic font from disk at runtime; make sure it ships with the function.
  outputFileTracingIncludes: {
    "/og/**": ["./assets/fonts/**/*"],
  },
};

export default nextConfig;
