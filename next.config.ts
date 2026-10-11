import type { NextConfig } from "next";

// Account pages can never be framed by another site.
const NO_FRAMING = [{ key: "Content-Security-Policy", value: "frame-ancestors 'none'" }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:page(sign-in|sign-up|forgot-password|reset-password)", headers: NO_FRAMING },
      { source: "/dashboard/:path*", headers: NO_FRAMING },
    ];
  },
};

export default nextConfig;
