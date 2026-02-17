/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        '@libsql/client',
        '@prisma/adapter-libsql',
        'libsql',
      );
    }
    return config;
  },
};

export default nextConfig;
