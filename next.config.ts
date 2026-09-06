import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mariadb uses native Node modules — keep it out of the webpack bundle
  serverExternalPackages: ["mariadb"],
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
