import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: 'export',  // next export 대신 이 옵션 사용
  images: {
    unoptimized: true, // Disable image optimization
  },
};

export default nextConfig;
