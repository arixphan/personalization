import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.SERVER_BASE_URL}/:path*`
      },
    ];
  },
};

export default withNextIntl(nextConfig);
