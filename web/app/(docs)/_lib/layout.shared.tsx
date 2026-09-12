import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { brandLogo, primaryNav } from "../../(site)/_lib/routes";
import { docsHome, repoUrl } from "./shared";

// Product routes use the other root layout, so following them is a full page load.
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      url: docsHome,
      title: (
        <span className="flex items-center gap-2.5">
          {/*
           * The master's chevron is white, so on cream it sits on the ink tile the product
           * header uses (app/icon.svg proportions: tile side = 1.2 x logo width). The tile is
           * ink in both themes because the master is never recolored.
           */}
          <span className="inline-grid size-9 shrink-0 place-items-center bg-ink">
            <img src={brandLogo} alt="" aria-hidden="true" width={30} height={18} />
          </span>
          <span className="text-[15px] font-bold tracking-tight">AquaQoS</span>
          <span className="border border-fd-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fd-muted-foreground">
            Docs
          </span>
        </span>
      ),
    },
    links: primaryNav
      .filter(({ href }) => href !== docsHome)
      .map(({ href, label }) => ({ text: label, url: href, active: "none" })),
    githubUrl: repoUrl,
    themeSwitch: { enabled: true, mode: "light-dark-system" },
  };
}
