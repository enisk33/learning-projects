// next.config.ts veya next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Limiti 50MB'a çıkarıyoruz (İhtiyacına göre artırabilirsin)
      bodySizeLimit: '500mb', 
    },
  },
};

export default nextConfig;
