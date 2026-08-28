/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    'localhost:3000',
    'localhost',
    '127.0.0.1:3000',
    '127.0.0.1',
    ...(process.env.ALLOWED_DEV_ORIGINS ? process.env.ALLOWED_DEV_ORIGINS.split(',') : []),
  ],
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@tabler/icons-react'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dandiyaraas',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
