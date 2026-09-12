import Link from "next/link";
import { heroTitle, productLine } from "../../(site)/_lib/copy";
import { brandLogo, routes } from "../../(site)/_lib/routes";

// Ten units of one worked example: two strategies, half the real backing guaranteed.
const units = Array.from({ length: 10 }, (_, i) => i < 5);

export function DocsHero() {
  return (
    <header className="doc-frame not-prose mb-10">
      <div className="doc-frame-head">
        <span>docs/index</span>
        <span>v0 prototype</span>
      </div>
      <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
        <div>
          {/* Ink tile: the master's white chevron needs a dark ground on cream. */}
          <span className="inline-grid size-[72px] shrink-0 place-items-center bg-ink">
            <img src={brandLogo} alt="AquaQoS" width={60} height={36} />
          </span>
          <div className="doc-label mt-8">
            <span>Documentation</span>
            <span className="doc-rule" />
            <span>001</span>
          </div>
          <h1 className="doc-display mt-4 text-[clamp(30px,3.3vw,46px)] font-bold leading-[1.15] tracking-[-0.01em] text-fd-foreground">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-fd-muted-foreground">
            {productLine} These pages explain the protocol; the proof page shows the receipts.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/docs/capacity/" className="doc-button doc-button-primary">
              Read the capacity model
            </Link>
            <Link href="/docs/reproduce/" className="doc-button">
              Developer reproduction
            </Link>
            <a
              href={routes.proof}
              className="inline-flex min-h-11 items-center px-2 text-[11px] uppercase tracking-[0.1em] text-fd-muted-foreground underline-offset-4 hover:text-fd-foreground hover:underline"
            >
              Open the receipts
            </a>
          </div>
        </div>
        <figure className="self-end">
          <div className="grid w-fit grid-cols-5 gap-1.5" aria-hidden="true">
            {units.map((guaranteed, i) => (
              <span
                key={i}
                className={
                  guaranteed
                    ? "size-5 bg-aq-fill"
                    : "size-5 border-2 border-dashed border-aq-line"
                }
              />
            ))}
          </div>
          <figcaption className="mt-3 max-w-44 text-[11px] leading-relaxed text-fd-muted-foreground">
            Solid: guaranteed. Outlined: burst. Two strategies, half the backing protected.
          </figcaption>
        </figure>
      </div>
    </header>
  );
}
