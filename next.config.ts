import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/doc',
                destination: '/doc/index.html',
            },
        ];
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    pageExtensions: ['tsx', 'ts'],
};

export default nextConfig;
