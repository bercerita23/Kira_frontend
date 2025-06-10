/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true, // Required for static export
  },
  // Configure for Amplify deployment
  trailingSlash: true,
  // Uncomment the following line if you want to deploy as a static site
  // output: 'export',
};

module.exports = nextConfig; 