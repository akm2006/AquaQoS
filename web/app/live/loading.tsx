export default function Loading() {
  return (
    <main id="main" className="workspace">
      <section className="panel load-panel" aria-busy="true">
        <span className="eyebrow">LIVE LOCAL EXECUTION</span>
        <h1>Preparing the local session view</h1>
        <div className="loading-track" />
      </section>
    </main>
  );
}
