import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";

const nextConfig: NextConfig = {
  experimental: {
    mdxRs: true,
    serverComponentsExternalPackages: ["@prisma/client", "@prisma/adapter-neon", "@neondatabase/serverless"],
  },
  webpack: (config) => {
    if (Array.isArray(config.externals)) {
      config.externals.push("@prisma/client", "@prisma/adapter-neon", "@neondatabase/serverless");
    }
    return config;
  },
};

export default withContentlayer(nextConfig);
