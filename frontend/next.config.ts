import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons"],
  },
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
