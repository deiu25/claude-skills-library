import type { NextConfig } from "next";

// Account pages can never be framed by another site, and send no Referer: some carry a token in
// their URL.
const ACCOUNT_PAGE = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:page(sign-in|sign-up|forgot-password|reset-password|two-factor|confirm-email-change)",
        headers: ACCOUNT_PAGE,
      },
      { source: "/dashboard/:path*", headers: ACCOUNT_PAGE },
    ];
  },
};

export default nextConfig;
