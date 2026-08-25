import type { NextConfig } from 'next';

const isTauri = process.env.TAURI_ENV_PLATFORM !== undefined;

const nextConfig: NextConfig = {
  output: isTauri ? 'export' : undefined,
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
