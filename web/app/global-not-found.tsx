import type { Metadata } from "next";
import { ButtonLink } from "./(site)/_components/Button";
import { routes } from "./(site)/_lib/routes";
import "./(site)/globals.css";

export const metadata: Metadata = { title: "Page not found · AquaQoS" };

// Site and docs are separate root layouts, so unmatched URLs render outside both.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main id="main" className="workspace load-panel">
          <p className="eyebrow">404 / PAGE NOT FOUND</p>
          <h1>This route has no position.</h1>
          <p>Start from the overview, the recorded scenarios or the docs.</p>
          <div className="button-row">
            <ButtonLink href={routes.home} variant="primary">
              Back to overview
            </ButtonLink>
            <ButtonLink href={routes.workspace}>Open workspace</ButtonLink>
            <ButtonLink href={routes.docs}>Read the docs</ButtonLink>
          </div>
        </main>
      </body>
    </html>
  );
}
