import { loader } from "fumadocs-core/source";
import { defineDocs } from "fumadocs-mdx/macro";

// The fumadocs-mdx macro compiles this into imports of web/content/docs; no codegen step.
const docs = defineDocs({ dir: "content/docs" });

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
