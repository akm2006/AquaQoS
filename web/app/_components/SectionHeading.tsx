export function SectionHeading({
  eyebrow,
  title,
  id,
  level = 2,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  id?: string;
  level?: 1 | 2;
  children?: React.ReactNode;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <Heading id={id}>{title}</Heading>
      {children && <p className="section-lede">{children}</p>}
    </div>
  );
}
