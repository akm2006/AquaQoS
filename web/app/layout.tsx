import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AquaQoS · Shared liquidity, protected capacity",
  description:
    "Explore protected-capacity scheduling for shared 1inch Aqua inventory. Compare recorded transactions and verify every outcome.",
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
            <Link href="/" prefetch={false} className="brand" aria-label="AquaQoS home">
              <span className="brand-mark" aria-hidden="true">
                ≋
              </span>
              Aqua<span>QoS</span>
              <small>v0</small>
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/" prefetch={false}>Workspace</Link>
              <Link href="/live/" prefetch={false}>Live execution</Link>
              <Link href="/proof/" prefetch={false}>
                Protocol evidence <span aria-hidden="true">↗</span>
              </Link>
            </nav>
            <span className="environment">
              <i />
              Local EVM
            </span>
          </div>
        </header>
        {children}
        <footer>
          <span>
            Powered by <strong>1inch Aqua + SwapVM</strong>
          </span>
          <span>Experimental v0 · Mock tokens · No public deployment</span>
          <Link href="/proof/" prefetch={false}>Scope & verification ↗</Link>
        </footer>
      </body>
    </html>
  );
}
