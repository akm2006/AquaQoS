import Link from "next/link";
import { external, routes } from "../_lib/routes";
import { BrandLogo } from "./BrandLogo";

// Names differ from the header's so each header link stays uniquely addressable.
const links = [
  { href: routes.workspace, label: "Recorded workspace" },
  { href: routes.onchain, label: "Sepolia deployment" },
  { href: routes.proof, label: "Scope & verification" },
  { href: routes.docs, label: "Documentation" },
  { href: external.github, label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-brand">
        <span className="brand">
          <BrandLogo tile size="compact" decorative />
          AquaQoS
        </span>
        <span>
          Powered by <strong>1inch Aqua + SwapVM</strong>
        </span>
        <small>Experimental v0 · Public Sepolia deployment</small>
      </div>
      <nav aria-label="Footer">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} prefetch={false}>
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
