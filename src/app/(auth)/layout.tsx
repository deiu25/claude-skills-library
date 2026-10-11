import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      {/* Top-aligned, not centred: a form message appearing must not shift the heading. */}
      <main id="main" className="mx-auto w-full max-w-md flex-1 px-4 py-16 sm:px-6 sm:py-24">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
