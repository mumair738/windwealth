/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable static page generation and prefetching
  experimental: {
    optimizePackageImports: ['@privy-io/react-auth'],
  },
  images: {
    domains: [
      'i.imgur.com',
      'cdn.builder.io',
      'via.placeholder.com',
      'images.unsplash.com',
      'www.larvalabs.com',
      'i.pinimg.com',
      'api.dicebear.com',
      // IPFS gateways for avatars
      'cloudflare-ipfs.com',
      'ipfs.io',
      'gateway.pinata.cloud',
      'dweb.link',
      'peach-impossible-chicken-451.mypinata.cloud',
    ],
    unoptimized: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.glsl$/,
        use: 'raw-loader',
      });
    }
    return config;
  },
}

module.exports = nextConfig

