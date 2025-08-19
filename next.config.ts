import type { NextConfig } from 'next'

const securityHeaders = [
  // Clickjacking protection
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Content-type sniffing protection
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Basic referrer privacy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Remove server info where possible
  {
    key: 'X-Powered-By',
    value: 'Next.js',
  },
  // Opt-in to a conservative set of browser features
  {
    key: 'Permissions-Policy',
    value: [
      'camera=(), microphone=(), geolocation=()',
      'accelerometer=(), ambient-light-sensor=(), autoplay=()',
      'encrypted-media=(), fullscreen=(self), gyroscope=()',
      'magnetometer=(), midi=(), payment=(), usb=()',
    ].join(', '),
  },
]

const nextConfig: NextConfig = {
    
  async headers() {
    return [
      {
        // Applies to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig