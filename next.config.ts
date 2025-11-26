import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configuração para permitir imagens externas (Cloudinary, etc)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig
