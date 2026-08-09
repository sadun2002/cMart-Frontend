import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'cmart.lk' },
      { protocol: 'https', hostname: '*.cmart.lk' },
    ],
  },
};

export default nextConfig;
