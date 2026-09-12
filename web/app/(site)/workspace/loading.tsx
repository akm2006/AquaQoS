export default function Loading() {
  return (
    <main id="main" className="workspace">
      <section className="panel load-panel" aria-busy="true">
        <span className="eyebrow">RECORDED CONTRACT STATE</span>
        <h1>Opening the capacity workspace</h1>
        <div className="loading-track" />
      </section>
    </main>
  );
}
