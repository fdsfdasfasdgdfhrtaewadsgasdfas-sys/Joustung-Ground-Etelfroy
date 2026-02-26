/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Recommended for compatibility with various hosting providers
    experimental: {
        serverActions: {
            allowedOrigins: ['*'], // Update this to your production domain later
        },
    },
};

export default nextConfig;
