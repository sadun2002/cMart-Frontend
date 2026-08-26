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
  ...(!isTauri && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-DNS-Prefetch-Control', value: 'on' },
            { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
            { key: 'X-XSS-Protection', value: '1; mode=block' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
