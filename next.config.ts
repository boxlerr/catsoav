import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mir-s3-cdn-cf.behance.net',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
      },
      {
        protocol: 'https',
        hostname: 'a.thumbs.redditmedia.com',
      },
      {
        protocol: 'https',
        hostname: 'www-ccv.adobe.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default nextConfig;
