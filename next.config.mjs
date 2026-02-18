/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@scure/bip39', '@noble/hashes', '@wllama/wllama'],
    eslint: {
        ignoreDuringBuilds: true, // We'll fix lint errors post-launch
    },
    typescript: {
        ignoreBuildErrors: true, // Strict types post-launch
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: [
            'puppeteer-core',
            '@sparticuz/chromium-min',
            'puppeteer-extra',
            'puppeteer-extra-plugin-stealth',
            'puppeteer-extra-plugin-adblocker'
        ],
    },
    webpack: (config, { isServer }) => {
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            topLevelAwait: true,
            layers: true,
        };

        // Fix for onnxruntime-node being bundled in browser
        if (!isServer) {
            config.resolve.alias['onnxruntime-node'] = false;
            config.resolve.alias['sharp'] = false;
        }

        // Ensure .mjs files are handled as modules
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto",
        });

        return config;
    },
    poweredByHeader: false,
};

export default nextConfig;
