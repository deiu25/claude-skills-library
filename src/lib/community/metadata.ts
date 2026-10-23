import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site";
import { summary } from "./format";

/**
 * A Community page's metadata, with its own canonical address and og:url. A page that sets
 * openGraph replaces the root's, image included, so the site's share image is named again here.
 * An unlisted skill asks search engines not to index it.
 */
export function communityMetadata({ title, description, path, unlisted = false }: { title: string; description: string; path: string; unlisted?: boolean }): Metadata {
  return {
    title,
    description: summary(description),
    alternates: { canonical: path },
    ...(unlisted && { robots: { index: false } }),
    openGraph: { type: "website", url: path, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }] },
  };
}
