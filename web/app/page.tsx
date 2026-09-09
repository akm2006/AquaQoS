import Workspace from "./workspace";

export default function Page() {
  return (
    <main id="main" className="workspace">
      <div className="page-heading">
        <div>
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
