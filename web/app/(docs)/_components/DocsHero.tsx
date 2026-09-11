import Link from "next/link";
import { heroTitle, productLine } from "../../(site)/_lib/copy";
import { brandLogo, routes } from "../../(site)/_lib/routes";

// Ten units of one worked example: two strategies, half the real backing guaranteed.
const units = Array.from({ length: 10 }, (_, i) => i < 5);

export function DocsHero() {
  return (
    <header className="not-prose mb-10 grid gap-10 rounded-2xl border border-fd-border bg-fd-card p-6 sm:p-10 lg:grid-cols-[1fr_auto]">
      <div>
        <img src={brandLogo} alt="AquaQoS" width={100} height={60} />
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-aq-sky">
          Documentation · v0 prototype
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-fd-foreground sm:text-5xl">
          {heroTitle}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-fd-muted-foreground">
          {productLine} These pages explain the protocol; the proof page shows the receipts.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/docs/capacity/"
            className="inline-flex min-h-11 items-center rounded-lg bg-aq-sky px-4 text-sm font-medium text-aq-ink transition-colors hover:bg-aq-cyan"
          >
            Read the capacity model
          </Link>
          <Link
            href="/docs/reproduce/"
            className="inline-flex min-h-11 items-center rounded-lg border border-fd-border px-4 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
          >
            Reproduce it
          </Link>
          <a
            href={routes.proof}
            className="inline-flex min-h-11 items-center px-2 text-sm text-fd-muted-foreground underline-offset-4 hover:text-fd-foreground hover:underline"
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
                  ? "size-5 bg-aq-cyan"
                  : "size-5 border border-dashed border-aq-sky/60"
              }
            />
          ))}
        </div>
        <figcaption className="mt-3 max-w-44 font-mono text-[11px] leading-relaxed text-fd-muted-foreground">
          Solid: guaranteed. Outlined: burst. Two strategies, half the backing protected.
        </figcaption>
      </figure>
    </header>
  );
}
