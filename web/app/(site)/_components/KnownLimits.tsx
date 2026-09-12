import { limitations } from "../_lib/copy";
import { evidence } from "../_lib/routes";

const sources = [
  { href: evidence.doc("SECURITY_REVIEW_V0"), label: "Security review" },
  { href: evidence.doc("BENCHMARK_METHODOLOGY"), label: "Benchmark methodology" },
  { href: evidence.doc("THIRD_PARTY"), label: "Sources and attribution" },
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
