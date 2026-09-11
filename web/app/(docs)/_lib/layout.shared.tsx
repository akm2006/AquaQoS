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
          <img
            src={brandLogo}
            alt=""
            aria-hidden="true"
            width={40}
            height={24}
            className="h-6 w-10"
          />
          <span className="text-[15px] font-semibold tracking-tight">AquaQoS</span>
          <span className="rounded-md border border-fd-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-aq-sky">
            Docs
          </span>
        </span>
      ),
    },
    links: primaryNav
      .filter(({ href }) => href !== docsHome)
      .map(({ href, label }) => ({ text: label, url: href, active: "none" })),
    githubUrl: repoUrl,
    themeSwitch: { enabled: false },
  };
}
