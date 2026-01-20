const path = require('path');

const nextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',
  // Turbopack config (required for Next.js 16+)
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  reactStrictMode: true,
  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
  // Disable all development indicators
  devIndicators: false,
  // Enable source maps in development
  productionBrowserSourceMaps: true,
  // Configure webpack to disable error overlay
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable the error overlay in development
      config.devtool = false;
    }
    return config;
  },
  // Headers required for WebContainer API (cross-origin isolation)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp', // Required by WebContainer
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Proxy API calls to backend, but exclude local API routes (site-builder, upload)
        source: '/api/:path((?!site-builder|upload).*)',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
        basePath: false
      }
    ]
  }
}

module.exports = nextConfig
