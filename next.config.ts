import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // output: 'export', // Removed to support dynamic routes like [domain]
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
