import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/nature-laws",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
