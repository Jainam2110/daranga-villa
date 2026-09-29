import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["razorpay", "mongoose"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
