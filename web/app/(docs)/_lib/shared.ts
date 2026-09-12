import { routes } from "../../(site)/_lib/routes";

export const docsHome = routes.docs;

// Written at build time by api/search.json/route.ts, then searched in the browser.
export const searchIndex = "/api/search.json";

export const repoUrl = "https://github.com/akm2006/AquaQoS";

// Docs cite repository files, never copies of them (docs/product/APP_ARCHITECTURE.md).
export const sourceUrl = (path: string) => `${repoUrl}/blob/main/${path}`;
