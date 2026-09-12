"use client";

import { ButtonLink } from "../_components/Button";
import { routes } from "../_lib/routes";

// Render failures only; local-service errors are handled inside LiveSession. Never fall
// back to recorded data here: the recorded workspace is a separate, labelled route.
export default function LiveError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main id="main" className="workspace">
      <section className="panel load-panel" role="alert">
        <span className="eyebrow">LIVE LOCAL EXECUTION</span>
        <h1>The live session view failed.</h1>
        <p>
          {error?.message || "An unexpected error stopped this page rendering."}
          {error?.digest && ` (${error.digest})`}
        </p>
        <div className="button-row">
          <button className="button primary" onClick={() => retry()}>
            Try again
          </button>
          <ButtonLink href={routes.workspace}>Open recorded workspace</ButtonLink>
        </div>
      </section>
    </main>
  );
}
