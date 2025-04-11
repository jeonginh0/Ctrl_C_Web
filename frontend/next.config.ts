import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  output: 'export',
  images: {
    unoptimized: true, // Disable image optimization
  },
  assetPrefix: './',  // 👈 export 시 상대경로로 설정
  basePath: '',
};

export default nextConfig;
