import { sourceUrl } from "../_lib/shared";

type Target = { label: string } & ({ path: string } | { href: string });

// Every docs page ends with the files that back its claims (APP_REFACTOR_GUIDE §4.5).
export function Verify({ items }: { items: Target[] }) {
  return (
    <ul className="not-prose my-6 grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const url = "href" in item ? item.href : sourceUrl(item.path);
        const detail = "href" in item ? new URL(item.href).host : item.path;
        return (
          <li key={url}>
            <a
              href={url}
              className="group flex h-full min-h-11 flex-col gap-1 border-2 border-fd-border bg-fd-card px-4 py-3 transition-colors hover:bg-fd-foreground"
            >
              <span className="text-[13px] font-bold text-fd-foreground group-hover:text-fd-background">
                {item.label}
              </span>
              <span className="break-all text-[11px] text-fd-muted-foreground group-hover:text-fd-background">
                {detail}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
