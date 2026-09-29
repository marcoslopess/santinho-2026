/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  // Gera .next/standalone para rodar com `node server.js` (ideal para Docker/VPS)
  output: "standalone",
  allowedDevOrigins: ["192.168.1.254"],
};

module.exports = nextConfig;
