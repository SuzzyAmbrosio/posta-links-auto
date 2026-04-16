/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  staticPageGenerationTimeout: 1000,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
