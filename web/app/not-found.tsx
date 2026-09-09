import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="workspace load-panel">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>This route has no position.</h1>
      <p>Return to the workspace to explore the recorded scenarios.</p>
      <Link className="button primary" href="/">
        Back to workspace →
      </Link>
    </main>
  );
}
