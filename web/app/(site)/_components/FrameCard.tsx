// 2px ink frame with a file-name header bar, after the template's bento and pricing cards.
export function FrameHead({
  label,
  meta,
}: {
  label: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="frame-head">
      <span>{label}</span>
      {meta != null && <span>{meta}</span>}
    </div>
  );
}

export function FrameCard({
  label,
  meta,
  invert = false,
  className = "",
  children,
}: {
  label: React.ReactNode;
  meta?: React.ReactNode;
  invert?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`frame${invert ? " frame-invert" : ""} ${className}`}>
      <FrameHead label={label} meta={meta} />
      {children}
    </div>
  );
}
