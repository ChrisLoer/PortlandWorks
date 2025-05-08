/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/PortlandWorks' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/PortlandWorks' : '',
};

module.exports = nextConfig; 
