import type { NextConfig } from 'next';
import path from 'path';

const GATEWAY_URL = process.env.GATEWAY_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  rewrites() {
    return Promise.resolve([
      {
        source: '/api/:path*',
        destination: `${GATEWAY_URL}/api/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${GATEWAY_URL}/socket.io/:path*`,
      },
    ]);
  },
};

export default nextConfig;
