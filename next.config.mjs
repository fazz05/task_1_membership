import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
      // Payload dev (Next di port 3000)
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/api/media/**' },
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/api/media/file/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3000', pathname: '/api/media/**' },
      // Jika ada file direct dari MinIO (endpoint lokal)
      { protocol: 'http', hostname: '127.0.0.1', port: '9000', pathname: '/**' },
      // Tambah domain produksi/CDN-mu di sini bila perlu:
      // { protocol: 'https', hostname: 'cdn.domainmu.com', port: '', pathname: '/**' },
    ],
  },

  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

