/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    
    // Internationalization
    i18n: {
      locales: ['en', 'fr', 'ig', 'de', 'yo', 'ha'],
      defaultLocale: 'en',
      localeDetection: false,
    },
  
    // Image optimization
    images: {
      domains: [
        'localhost',
        'yourdomain.com',
        'api.yourdomain.com',
        'avatars.githubusercontent.com',
        'lh3.googleusercontent.com',
      ],
      formats: ['image/avif', 'image/webp'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
  
    // Headers for security and CORS
    async headers() {
      return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          ],
        },
        {
          source: '/embed/:path*',
          headers: [
            { key: 'X-Frame-Options', value: 'ALLOWALL' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,POST' },
          ],
        },
        {
          source: '/:path*',
          headers: [
            { key: 'X-DNS-Prefetch-Control', value: 'on' },
            { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          ],
        },
      ];
    },
  
    // Redirects
    async redirects() {
      return [
        {
          source: '/home',
          destination: '/',
          permanent: true,
        },
        {
          source: '/admin',
          destination: '/dashboard',
          permanent: false,
        },
      ];
    },
  
    // Rewrites for API proxy
    async rewrites() {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/:path*`,
        },
      ];
    },
  
    // Environment variables
    env: {
      APP_VERSION: process.env.npm_package_version,
      BUILD_TIME: new Date().toISOString(),
    },
  
    // Webpack configuration
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // Add custom webpack configurations here
      
      // Handle audio files
      config.module.rules.push({
        test: /\.(mp3|wav|ogg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/audio/[name].[hash][ext]',
        },
      });

      // Handle other media files
      config.module.rules.push({
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/fonts/[name].[hash][ext]',
        },
      });

      // Ignore specific modules in browser
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
          path: false,
          os: false,
          stream: false,
          util: false,
        };
      }

      // Add aliases
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': __dirname,
      };

      // Bundle analyzer
      if (process.env.ANALYZE) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './analyze.html',
            openAnalyzer: true,
          })
        );
      }

      return config;
    },
  
    // Experimental features
    experimental: {
      // Enable server actions if needed
      serverActions: {
        allowedOrigins: ['localhost:3000', 'yourdomain.com'],
      },
    },
  
    // Output configuration
    output: 'standalone',
    
    // TypeScript configuration
    typescript: {
      ignoreBuildErrors: false,
    },
  
    // ESLint configuration
    eslint: {
      ignoreDuringBuilds: false,
    },
  
    // PWA configuration (optional)
    // If you want to add PWA support, install next-pwa
    // const withPWA = require('next-pwa')({
    //   dest: 'public',
    //   disable: process.env.NODE_ENV === 'development',
    // });
  
    // Compression
    compress: true,
  
    // Trailing slash
    trailingSlash: false,
  
    // Generate ETags
    generateEtags: true,
  
    // Power by header
    poweredByHeader: false,
  
    // React production profiling
    productionBrowserSourceMaps: false,
  };
  
  module.exports = withBundleAnalyzer(nextConfig);