import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api",
        destination: process.env.SERVER_BASE_URL || "http://localhost:3000/api",
      },
    ];
  },
};

export default nextConfig;
