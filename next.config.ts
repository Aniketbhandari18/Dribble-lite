import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '11mb', // or '20mb' if you expect larger
    },
  },

};

export default nextConfig;
