/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { dirs: ['app', 'pages', 'lib', 'prisma'], ignoreDuringBuilds: true },
};

module.exports = nextConfig;
