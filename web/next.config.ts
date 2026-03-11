import path from 'path';
import type { NextConfig } from 'next';

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
        destination: `${GATEWAY_URL}/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${GATEWAY_URL}/socket.io/:path*`,
      },
    ]);
  },
};

export default nextConfig;
