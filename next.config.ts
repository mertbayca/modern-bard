import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";

const nextConfig: NextConfig = {
  experimental: {
    mdxRs: true,
  },
};

export default withContentlayer(nextConfig);
