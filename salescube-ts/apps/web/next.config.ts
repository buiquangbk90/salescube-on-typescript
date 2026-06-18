import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@salescube/shared', '@salescube/ui'],
  typedRoutes: true,
};

export default nextConfig;
