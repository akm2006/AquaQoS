"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { productNav } from "../_lib/routes";

const trim = (path: string) => path.replace(/\/+$/, "");

export function NavLinks() {
  const pathname = trim(usePathname() ?? "");
  return (
    <nav aria-label="Main navigation">
      {productNav.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          prefetch={false}
          aria-current={trim(href) === pathname ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
