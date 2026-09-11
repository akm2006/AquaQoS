import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "./_components/BrandLogo";
import { ButtonLink } from "./_components/Button";
import { siteDescription } from "./_lib/copy";
import { primaryNav, routes } from "./_lib/routes";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AquaQoS · Shared liquidity, scheduled",
    template: "%s · AquaQoS",
  },
  description: siteDescription,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <header className="topbar">
          <div className="nav-wrap">
            <Link
              href={routes.home}
              prefetch={false}
              className="brand"
              aria-label="AquaQoS home"
            >
              <BrandLogo decorative />
              AquaQoS
            </Link>
            <nav aria-label="Main navigation">
              {primaryNav.map(({ href, label }) => (
                <Link key={href} href={href} prefetch={false}>
                  {label}
                </Link>
              ))}
            </nav>
            <ButtonLink href={routes.live} variant="primary">
              Run live local demo
            </ButtonLink>
          </div>
        </header>
        {children}
        <footer>
          <span>
            Powered by <strong>1inch Aqua + SwapVM</strong>
          </span>
          <span>Experimental v0 · No external audit · No mainnet deployment</span>
          <Link href={routes.proof} prefetch={false}>
            Scope & verification
          </Link>
        </footer>
      </body>
    </html>
  );
}
