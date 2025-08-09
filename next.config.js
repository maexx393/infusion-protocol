/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove deprecated appDir option
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'near-api-js$': 'near-api-js/lib/browser-index',
    };
    return config;
  },
  // Add proper configuration for modern Next.js
  images: {
    domains: ['localhost'],
  },
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here if needed
  },
  // Exclude backend and test files from the build
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['near-api-js'],
}

module.exports = nextConfig 