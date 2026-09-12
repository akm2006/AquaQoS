// Internal links live here so a route move is a one-line change.
export const routes = {
  home: "/",
  workspace: "/workspace/",
  onchain: "/onchain/",
  live: "/live/",
  proof: "/proof/",
  docs: "/docs/",
} as const;

export const primaryNav = [
  { href: routes.home, label: "Overview" },
  { href: routes.workspace, label: "Workspace" },
  { href: routes.onchain, label: "Onchain" },
  { href: routes.proof, label: "Proof" },
  { href: routes.docs, label: "Docs" },
] as const;

// The product header links home through the brand; the docs header keeps primaryNav.
export const productNav = primaryNav.filter(({ href }) => href !== routes.home);

export const evidence = {
  report: "/evidence/report.json",
  manifest: "/evidence/manifest.json",
} as const;

export const external = {
  aqua: "https://1inch.com/aqua",
  github: "https://github.com/akm2006/AquaQoS",
  routerSource: "https://github.com/akm2006/AquaQoS/blob/main/contracts/AquaQoSRouter.sol",
} as const;

export const brandLogo = "/brand/AquaQoS.svg";
