/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['zustand', 'use-sync-external-store'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  webpack: (config) => {
    config.output.hashFunction = 'sha256'
    return config
  },
}

export default nextConfig
