/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow loading 3D model files from Meshy CDN
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.meshy.ai" },
      { protocol: "https", hostname: "assets.meshy.ai" },
    ],
  },
};

module.exports = nextConfig;
