import { createMDX } from "fumadocs-mdx/next";

// .mjs because fumadocs-mdx is ESM-only. See docs/DECISIONS.md D024.
/** @type {import("next").NextConfig} */
const config = {
  output: "export",
  trailingSlash: true,
  agentRules: false,
  // (site) and (docs) are separate root layouts, so unmatched URLs need one global 404.
  experimental: { globalNotFound: true },
};

export default createMDX()(config);
