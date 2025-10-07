import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    serverExternalPackages: ['knex'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'polymarket-upload.s3.us-east-2.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: 'polymarket.com',
            },
        ],
    },
    transpilePackages: ['@robin-pm-staking/common'],
};

export default nextConfig;
