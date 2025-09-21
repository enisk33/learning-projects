import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MongoDB için server external packages
  serverExternalPackages: ["mongodb"], 
  
  // Cross-origin warning'i gidermek için
  allowedDevOrigins: ["https://shellie-commotional-lurkingly.ngrok-free.dev"],
  
  // Turbopack root ayarı - lockfile uyarısını gidermek için
  turbopack: {
    root: process.cwd(),
  },
  
  // Server Actions için body size limit (video upload için gerekli)
  // Varsayılan 1MB, biz 50MB'a çıkarıyoruz
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
} 

export default nextConfig;