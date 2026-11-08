import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // Konva canvas works best without double mount in dev
  transpilePackages: [
    '@visualflow/shared-types',
    '@visualflow/document-schema',
    '@visualflow/editor-core',
  ],
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  images: {
    domains: ['images.unsplash.com', 'raw.githubusercontent.com'],
  },
};

export default nextConfig;
