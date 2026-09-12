import { brandLogo } from "../_lib/routes";

// Heights for the unchanged 250×150 master. Never recolor, rotate or animate its paths.
const heights = { compact: 24, header: 30, hero: 120 } as const;
// The white chevron vanishes on cream, so product surfaces seat the master on an ink tile
// with the favicon's proportions (app/icon.svg): tile side = 1.2 × logo width.
const tiles = { compact: 28, header: 36, hero: 120 } as const;

export function BrandLogo({
  size = "header",
  decorative = false,
  tile = false,
}: {
  size?: keyof typeof heights;
  decorative?: boolean;
  tile?: boolean;
}) {
  const width = tile
    ? Math.round(tiles[size] / 1.2)
    : Math.round((heights[size] * 250) / 150);
  const logo = (
    <img
      className={`brand-logo brand-logo-${size}`}
      src={brandLogo}
      width={width}
      height={Math.round((width * 150) / 250)}
      alt={decorative ? "" : "AquaQoS"}
      aria-hidden={decorative || undefined}
    />
  );
  return tile ? (
    <span className={`logo-tile logo-tile-${size}`}>{logo}</span>
  ) : (
    logo
  );
}
