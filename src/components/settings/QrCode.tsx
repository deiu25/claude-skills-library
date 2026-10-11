import { encode } from "uqr";

/**
 * A QR code drawn as one SVG path. Black on white in both themes, with its quiet zone, because
 * some authenticator apps cannot read an inverted code.
 */
export function QrCode({ text, label }: { text: string; label: string }) {
  const { data, size } = encode(text, { border: 4 });
  let path = "";
  data.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark) path += `M${x} ${y}h1v1h-1z`;
    }),
  );
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className="h-48 w-48 rounded-[8px] bg-white"
    >
      <path d={path} className="fill-black" />
    </svg>
  );
}
