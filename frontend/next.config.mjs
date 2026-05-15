/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? '/_/backend/api/:path*' 
          : 'http://localhost:5001/api/:path*',
      },
    ]
  }
};

export default nextConfig;
