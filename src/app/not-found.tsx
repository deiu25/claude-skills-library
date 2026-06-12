import Link from "next/link";
import { Compass } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-24 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Compass size={40} className="text-faint" aria-hidden />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            This page does not exist.
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            The skill may have been renamed or removed. The full library is one click away.
          </p>
          <Link href="/skills" className="btn btn-primary mt-2 text-sm">
            Browse all skills
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
