import Svg, {
  Circle,
  Line,
  Polygon,
  Text as SvgText,
} from 'react-native-svg';

export type RadarAxis = {
  label: string;
  /** Normalised value in [0, 1]. */
  value: number;
};

type Props = {
  axes: RadarAxis[];
  size?: number;
  /** Filled data colour. */
  color?: string;
  gridColor?: string;
  labelColor?: string;
};

const GRID_LEVELS = 4;

function polarPt(
  cx: number,
  cy: number,
  r: number,
  angleRad: number,
): { x: number; y: number } {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function toPolyPoints(pts: { x: number; y: number }[]): string {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

function clamp01(v: number): number {
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
}

export function RadarChart({
  axes,
  size = 280,
  color = '#EA580C',
  gridColor = '#273042',
  labelColor = '#a1a1aa',
}: Props) {
  const n = axes.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  // Leave space for labels around the edge.
  const r = size * 0.30;
  const labelR = r + 30;

  const axisAngle = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;

  // Background grid polygons (25 % … 100 %).
  const gridPolygons = Array.from({ length: GRID_LEVELS }, (_, level) => {
    const frac = (level + 1) / GRID_LEVELS;
    const pts = Array.from({ length: n }, (_, i) =>
      polarPt(cx, cy, r * frac, axisAngle(i)),
    );
    return { frac, points: toPolyPoints(pts) };
  });

  // Spoke lines from centre to edge.
  const spokes = Array.from({ length: n }, (_, i) => {
    const tip = polarPt(cx, cy, r, axisAngle(i));
    return { x1: cx, y1: cy, x2: tip.x, y2: tip.y };
  });

  // Data polygon.
  const dataPts = axes.map((axis, i) =>
    polarPt(cx, cy, r * clamp01(axis.value), axisAngle(i)),
  );
  const dataPolyPoints = toPolyPoints(dataPts);

  // Labels — tweak textAnchor by horizontal position.
  const labelItems = axes.map((axis, i) => {
    const a = axisAngle(i);
    const p = polarPt(cx, cy, labelR, a);
    const cosA = Math.cos(a);
    const anchor: 'start' | 'middle' | 'end' =
      cosA > 0.15 ? 'start' : cosA < -0.15 ? 'end' : 'middle';
    // Shift label left/right a touch when it's near horizontal.
    const xNudge = cosA > 0.15 ? 4 : cosA < -0.15 ? -4 : 0;
    return { x: p.x + xNudge, y: p.y, label: axis.label, anchor };
  });

  return (
    <Svg width={size} height={size}>
      {/* Grid rings */}
      {gridPolygons.map((g, i) => (
        <Polygon
          key={`grid-${i}`}
          points={g.points}
          fill="none"
          stroke={gridColor}
          strokeWidth={1}
        />
      ))}

      {/* Spokes */}
      {spokes.map((s, i) => (
        <Line
          key={`spoke-${i}`}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={gridColor}
          strokeWidth={1}
        />
      ))}

      {/* Data area */}
      <Polygon
        points={dataPolyPoints}
        fill={color}
        fillOpacity={0.22}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Vertex dots */}
      {dataPts.map((p, i) => (
        <Circle key={`dot-${i}`} cx={p.x} cy={p.y} r={4} fill={color} />
      ))}

      {/* Axis labels */}
      {labelItems.map((lbl, i) => (
        <SvgText
          key={`lbl-${i}`}
          x={lbl.x}
          y={lbl.y}
          textAnchor={lbl.anchor}
          fill={labelColor}
          fontSize={11}
          fontWeight="600"
          dy="4"
        >
          {lbl.label}
        </SvgText>
      ))}
    </Svg>
  );
}
