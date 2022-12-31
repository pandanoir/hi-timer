/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  eslint: { dirs: ['app', 'pages', 'lib', 'prisma'] },
};

module.exports = nextConfig;
