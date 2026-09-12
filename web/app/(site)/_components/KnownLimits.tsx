import { limitations } from "../_lib/copy";

const sources = [
  { href: "/docs/security/", label: "Security model" },
  { href: "/docs/benchmarks/", label: "Benchmark methodology" },
  { href: "/docs/sources/", label: "Sources and licenses" },
];

export function KnownLimits() {
  return (
    <div className="frame">
      <div className="frame-head">
        <span>KNOWN_LIMITS.md</span>
        <span>{limitations.length} items</span>
      </div>
      <ol className="limits-list">
        {limitations.map((item, i) => (
          <li key={item}>
            <span className="limits-id" aria-hidden="true">
              L{String(i + 1).padStart(2, "0")}
            </span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
      <div className="limits-sources">
        <span>Sources</span>
        {sources.map(({ href, label }) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
