import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: [
    '@visualflow/shared-types',
    '@visualflow/document-schema',
    '@visualflow/editor-core',
  ],
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      'konva$': 'konva/lib/index.js',
    };
    return config;
  },
  images: {
    domains: ['images.unsplash.com', 'raw.githubusercontent.com'],
  },
};

export default nextConfig;
