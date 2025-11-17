/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-689d7a8bcb6847b2b08626c9ae4f3c5f.r2.dev',
        port: '',
        pathname: '/**', // allow all paths under this host
      },
    ],
  },
};

module.exports = nextConfig;
