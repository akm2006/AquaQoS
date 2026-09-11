import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "../_lib/layout.shared";
import { source } from "../_lib/source";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      {...baseOptions()}
      tree={source.getPageTree()}
      sidebar={{
        banner: (
          <p className="rounded-lg border border-fd-border px-3 py-2 font-mono text-[11px] leading-relaxed text-fd-muted-foreground">
            Experimental v0 · No external audit · No mainnet deployment
          </p>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
