import type { Metadata } from "next";
import { StatusBadge } from "../_components/StatusBadge";
import { workspaceEnvironment } from "../_lib/copy";
import Workspace from "./Workspace";

export const metadata: Metadata = { title: "Recorded workspace" };

export default function WorkspacePage() {
  return (
    <main id="main" className="workspace">
      <div className="page-heading">
        <div>
          <StatusBadge kind="recorded">{workspaceEnvironment}</StatusBadge>
          <p className="eyebrow">CAPACITY WORKSPACE</p>
          <h1>
            Shared liquidity.
            <br className="mobile-only" /> Defined boundaries.
          </h1>
          <p>
            See how competing strategies use one inventory—and what remains
            protected.
          </p>
        </div>
        <span className="heading-note">
          <span className="tiny-square" /> CANONICAL XYC / FEE-FREE
        </span>
      </div>
      <Workspace />
    </main>
  );
}
