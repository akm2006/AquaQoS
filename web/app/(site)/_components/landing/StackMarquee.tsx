import { builtOn } from "../../_lib/copy";
import { sourceCommit } from "../../_lib/landing-evidence";
import { SectionLabel } from "../SectionLabel";

// The template's partner marquee, reduced to pinned identities. Text only: none of these are
// endorsements, so no third-party marks are drawn (docs/THIRD_PARTY.md).
export function StackMarquee() {
  return (
    <section className="landing-section" aria-labelledby="built-on">
      <SectionLabel index="005">{"// BUILT_ON: SOURCE_PINNED"}</SectionLabel>
      <h2 id="built-on" className="sr-only">
        Pinned sources
      </h2>
      <div className="marquee">
        <div className="marquee-track">
          <ul>
            {builtOn.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <ul aria-hidden="true">
            {builtOn.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="source-line">
        Report source <code>{sourceCommit}</code> · versions pinned in{" "}
        <code>package.json</code> and <code>hardhat.config.ts</code>
      </p>
    </section>
  );
}
