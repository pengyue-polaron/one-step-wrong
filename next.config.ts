import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  devIndicators: false,
  output: process.env.NEXT_OUTPUT_MODE === "standalone" ? "standalone" : undefined,
  poweredByHeader: false,
  serverExternalPackages: ["@openai/codex-sdk"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
