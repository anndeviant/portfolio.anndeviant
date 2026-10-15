import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tgbmdjqpwdwyaeoijtnx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.upnyk.ac.id",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "skillicons.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.iconify.design",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
