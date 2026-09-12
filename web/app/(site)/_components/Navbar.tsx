import Link from "next/link";
import { routes } from "../_lib/routes";
import { BrandLogo } from "./BrandLogo";
import { ButtonLink } from "./Button";
import { NavLinks } from "./NavLinks";

export function Navbar() {
  return (
    <header className="site-header">
      <div className="site-nav">
        <Link
          href={routes.home}
          prefetch={false}
          className="brand"
          aria-label="AquaQoS home"
        >
          <BrandLogo tile decorative />
          AquaQoS
        </Link>
        <NavLinks />
        <ButtonLink href={routes.live} variant="primary">
          Run live local demo
        </ButtonLink>
      </div>
    </header>
  );
}
