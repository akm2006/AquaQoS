import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "workspace/", "onchain/", "proof/", "docs/"].map((path) => ({
    url: `https://aquaqos.vercel.app/${path}`,
    lastModified: new Date("2026-09-13"),
  }));
}
