/** @type {import('next').NextConfig} */

const nextConfig = {
  
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  output: "standalone",

  images: {
    // domains: ['psc2.cf2.poecdn.net'],
  },
};

export default nextConfig;
