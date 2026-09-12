// The template's "// SECTION: NAME ─── 00N" rule. Decorative: each section keeps a real heading.
export function SectionLabel({
  children,
  index,
  live = false,
}: {
  children: string;
  index: string;
  live?: boolean;
}) {
  return (
    <div className="section-label" aria-hidden="true">
      <span>{children}</span>
      <span className="section-rule" />
      {live && <span className="blink-square" />}
      <span>{index}</span>
    </div>
  );
}
