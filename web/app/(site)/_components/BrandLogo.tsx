import { brandLogo } from "../_lib/routes";

// Heights for the unchanged 250×150 master. Never recolor, rotate or animate its paths.
const heights = { compact: 24, header: 30, hero: 120 } as const;

export function BrandLogo({
  size = "header",
  decorative = false,
}: {
  size?: keyof typeof heights;
  decorative?: boolean;
}) {
  const height = heights[size];
  return (
    <img
      className={`brand-logo brand-logo-${size}`}
      src={brandLogo}
      width={Math.round((height * 250) / 150)}
      height={height}
      alt={decorative ? "" : "AquaQoS"}
      aria-hidden={decorative || undefined}
    />
  );
}
