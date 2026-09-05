/* ── Tiny pixel-art glyphs shared by the Frutthon page + banner ── */

export function PixelArrow({ color }: { color: string }) {
  return (
    <svg
      className="frutthon-glyph"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d="M2 0h2v2H2zM4 2h2v2H4zM6 4h2v4H6zM4 8h2v2H4zM2 10h2v2H2z" fill={color} />
    </svg>
  );
}

export function PixelCheck() {
  return (
    <svg
      className="frutthon-glyph"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d="M0 6h2v2H0zM2 8h2v2H2zM4 6h2v2H4zM6 4h2v2H6zM8 2h2v2H8zM10 0h2v2h-2z" fill="#3be07e" />
    </svg>
  );
}

export function PixelTrophy() {
  return (
    <svg width="56" height="56" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path
        d="M3 1h10v1H3zM2 2h1v4H2zM13 2h1v4h-1zM3 2h10v6H3zM1 3h1v2H1zM14 3h1v2h-1zM4 8h8v1H4zM5 9h6v1H5zM6 10h4v2H6zM5 12h6v1H5zM4 13h8v2H4z"
        fill="#ffd95e"
      />
      <path d="M7 4h2v1H7zM6 5h1v1H6zM9 5h1v1H9zM7 6h2v1H7z" fill="#8a3a20" />
    </svg>
  );
}

export function PixelTarget() {
  return (
    <svg width="56" height="56" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path
        d="M5 1h6v1H5zM3 2h2v1H3zM11 2h2v1h-2zM2 3h1v2H2zM13 3h1v2h-1zM1 5h1v6H1zM14 5h1v6h-1zM2 11h1v2H2zM13 11h1v2h-1zM3 13h2v1H3zM11 13h2v1h-2zM5 14h6v1H5zM7 4h2v2H7zM4 7h2v2H4zM10 7h2v2h-2zM7 10h2v2H7z"
        fill="#ff4f9d"
      />
      <path d="M7 7h2v2H7z" fill="#ffd95e" />
    </svg>
  );
}

/** the praça bunting, stretched across the top of a card */
export function Bunting() {
  const flags: [number, number, string][] = [
    [67, 12, "#ff4f9d"], [167, 20, "#42d9cf"], [267, 24, "#ffd95e"], [367, 21, "#8d5dff"],
    [467, 15, "#ff4f9d"], [607, 15, "#42d9cf"], [707, 21, "#ffd95e"], [807, 24, "#ff4f9d"],
    [907, 20, "#8d5dff"], [1007, 12, "#42d9cf"],
  ];
  return (
    <svg
      className="frutthon-bunting"
      viewBox="0 0 1060 40"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d="M0 6 Q265 34 530 12 Q795 34 1060 6" fill="none" stroke="#d0c8e8" strokeWidth="2" />
      {flags.map(([x, y, c]) => (
        <path key={x} d={`M${x - 7} ${y} L${x + 7} ${y} L${x} ${y + 14} Z`} fill={c} />
      ))}
    </svg>
  );
}
