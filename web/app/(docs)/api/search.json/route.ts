import { createFromSource } from "fumadocs-core/search/server";
import { source } from "../../_lib/source";

// Rendered once by `next build` to out/api/search.json; the dialog searches it in the browser.
export const dynamic = "force-static";
export const { staticGET: GET } = createFromSource(source, { language: "english" });
