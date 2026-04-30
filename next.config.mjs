/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // hide "X-Powered-By: Next.js"
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    minimumCacheTTL: 60, // cap image-optimizer disk growth
  },
  experimental: {
    optimizePackageImports: ["recharts", "framer-motion", "date-fns"],
  },
  async headers() {
    // CSP: 'unsafe-inline' on script-src is required by Next.js's inline runtime bootstrap;
    // 'unsafe-eval' is required for the dev React Refresh runtime. Style 'unsafe-inline' is
    // needed for Tailwind injected styles and Material Symbols. img-src allows data: for
    // inline SVGs and the avatar hosts whitelisted in `images.remotePatterns`.
    const isDev = process.env.NODE_ENV !== "production";
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      // HSTS only meaningful when served over HTTPS in production
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "Content-Security-Policy", value: csp },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
