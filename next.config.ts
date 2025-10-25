import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  experimental: {
    mdxRs: true,
  },
  // Empty turbopack config to silence the webpack warning
  turbopack: {},
  // Ensure API routes work properly
  rewrites: async () => {
    return [];
  },
};

export default withContentlayer(nextConfig);
