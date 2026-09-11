import { ButtonLink } from "./_components/Button";
import { routes } from "./_lib/routes";

export default function NotFound() {
  return (
    <main id="main" className="workspace load-panel">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>This route has no position.</h1>
      <p>Start from the overview or open the recorded scenarios.</p>
      <div className="button-row">
        <ButtonLink href={routes.home} variant="primary">
          Back to overview
        </ButtonLink>
        <ButtonLink href={routes.workspace}>Open workspace</ButtonLink>
      </div>
    </main>
  );
}
