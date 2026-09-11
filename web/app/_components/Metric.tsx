// A number is shown only with its unit and where it came from.
export function Metric({
  label,
  value,
  unit,
  provenance,
  children,
}: {
  label: string;
  value: string;
  unit?: string;
  provenance: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <strong className="metric-value">
        {value}
        {unit && <small> {unit}</small>}
      </strong>
      <span className="metric-provenance">{provenance}</span>
      {children && <p>{children}</p>}
    </div>
  );
}
