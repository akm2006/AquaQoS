import Link from "next/link";

// App routes use next/link; evidence files and external sources are plain anchors.
export function ButtonLink({
  href,
  children,
  variant = "secondary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const className = variant === "primary" ? "button primary" : "button";
  if (href.startsWith("/") && !href.startsWith("/evidence/"))
    return (
      <Link className={className} href={href} prefetch={false}>
        {children}
      </Link>
    );
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}
