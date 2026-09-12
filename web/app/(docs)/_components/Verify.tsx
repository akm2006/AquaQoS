import { sourceUrl } from "../_lib/shared";

type Target = { label: string } & ({ path: string } | { href: string });

// Every docs page ends with the files that back its claims (docs/product/APP_ARCHITECTURE.md).
export function Verify({ items }: { items: Target[] }) {
  return (
    <ul className="not-prose my-6 grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const isRepositorySource = !("href" in item);
        const url = isRepositorySource ? sourceUrl(item.path) : item.href;
        const detail = isRepositorySource ? item.path : new URL(item.href).host;
        const action = isRepositorySource
          ? "View source on GitHub"
          : "Open reference";
        return (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full min-h-11 flex-col gap-1 border-2 border-fd-border bg-fd-card px-4 py-3 transition-colors hover:bg-fd-foreground"
            >
              <span className="text-[13px] font-bold text-fd-foreground group-hover:text-fd-background">
                {item.label}
              </span>
              <span className="break-all text-[11px] text-fd-muted-foreground group-hover:text-fd-background">
                {action} · {detail}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
