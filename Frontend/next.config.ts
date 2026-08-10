import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable floating development indicator badge
  devIndicators: false,

  // Faster cold compiles + smaller client bundles for icon/chart libs
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },

  // Production response compression
  compress: true,

  // Avoid shipping browser source maps in production
  productionBrowserSourceMaps: false,

  // Keep powered-by header off (tiny security/perf win)
  poweredByHeader: false,

  // Turbopack is default in Next.js 16; keep config explicit for clarity
  turbopack: {},
};

export default nextConfig;
