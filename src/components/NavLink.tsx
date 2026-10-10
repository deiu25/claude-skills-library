"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ariaCurrent } from "@/lib/site";

interface NavLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

/** Header link that marks the section you are in with aria-current. */
export function NavLink({ href, className, children }: NavLinkProps) {
  return (
    <Link href={href} aria-current={ariaCurrent(usePathname(), href)} className={className}>
      {children}
    </Link>
  );
}
