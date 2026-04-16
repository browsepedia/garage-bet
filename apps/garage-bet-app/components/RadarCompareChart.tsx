import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import type { RadarAxis } from './RadarChart';

type Props = {
  /** Same length as secondary; labels taken from primary. */
  primaryAxes: RadarAxis[];
  secondaryAxes: RadarAxis[];
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  gridColor?: string;
  labelColor?: string;
};

const GRID_LEVELS = 4;
const FONT_SIZE = 11;
const CHAR_W = 6.2;
const BOUNDS_PAD = 5;

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

type BBox = { minX: number; maxX: number; minY: number; maxY: number };

function emptyBBox(): BBox {
  return {
    minX: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };
}

function addRect(b: BBox, x: number, y: number, halfW: number, halfH: number) {
  b.minX = Math.min(b.minX, x - halfW);
  b.maxX = Math.max(b.maxX, x + halfW);
  b.minY = Math.min(b.minY, y - halfH);
  b.maxY = Math.max(b.maxY, y + halfH);
}

function addPoint(b: BBox, x: number, y: number, inset = 0) {
  addRect(b, x, y, inset, inset);
}

function computeTightViewBox(
  n: number,
  cx: number,
  cy: number,
  r: number,
  labelR: number,
  primaryAxes: RadarAxis[],
  secondaryAxes: RadarAxis[],
  labelLayout: {
    x: number;
    y: number;
    label: string;
    anchor: 'start' | 'middle' | 'end';
  }[],
): { minX: number; minY: number; width: number; height: number } {
  const b = emptyBBox();
  const axisAngle = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;

  for (let level = 0; level < GRID_LEVELS; level++) {
    const frac = (level + 1) / GRID_LEVELS;
    for (let i = 0; i < n; i++) {
      const p = polarPt(cx, cy, r * frac, axisAngle(i));
      addPoint(b, p.x, p.y, 1.5);
    }
  }

  for (let i = 0; i < n; i++) {
    const tip = polarPt(cx, cy, r, axisAngle(i));
    addPoint(b, cx, cy, 1);
    addPoint(b, tip.x, tip.y, 1);
  }

  for (let i = 0; i < n; i++) {
    const p1 = polarPt(
      cx,
      cy,
      r * clamp01(primaryAxes[i]?.value ?? 0),
      axisAngle(i),
    );
    addPoint(b, p1.x, p1.y, 6);
    const p2 = polarPt(
      cx,
      cy,
      r * clamp01(secondaryAxes[i]?.value ?? 0),
      axisAngle(i),
    );
    addPoint(b, p2.x, p2.y, 6);
  }

  const baselineDy = 4;
  const asc = FONT_SIZE * 0.72;
  const desc = FONT_SIZE * 0.28;

  for (let i = 0; i < labelLayout.length; i++) {
    const lbl = labelLayout[i];
    const textW = lbl.label.length * CHAR_W;
    const bx = lbl.x;
    const baselineY = lbl.y + baselineDy;
    const top = baselineY - asc;
    const bottom = baselineY + desc;

    if (lbl.anchor === 'start') {
      b.minX = Math.min(b.minX, bx);
      b.maxX = Math.max(b.maxX, bx + textW);
    } else if (lbl.anchor === 'end') {
      b.minX = Math.min(b.minX, bx - textW);
      b.maxX = Math.max(b.maxX, bx);
    } else {
      b.minX = Math.min(b.minX, bx - textW / 2);
      b.maxX = Math.max(b.maxX, bx + textW / 2);
    }
    b.minY = Math.min(b.minY, top);
    b.maxY = Math.max(b.maxY, bottom);
  }

  const pad = BOUNDS_PAD;
  const minX = b.minX - pad;
  const minY = b.minY - pad;
  const width = Math.max(1, b.maxX - b.minX + 2 * pad);
  const height = Math.max(1, b.maxY - b.minY + 2 * pad);
  return { minX, minY, width, height };
}

export function RadarCompareChart({
  primaryAxes,
  secondaryAxes,
  size = 280,
  primaryColor = '#EA580C',
  secondaryColor = '#60a5fa',
  gridColor = '#273042',
  labelColor = '#a1a1aa',
}: Props) {
  const n = primaryAxes.length;
  if (n < 3 || secondaryAxes.length !== n) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.33;
  const labelR = r + 16;

  const axisAngle = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;

  const gridPolygons = Array.from({ length: GRID_LEVELS }, (_, level) => {
    const frac = (level + 1) / GRID_LEVELS;
    const pts = Array.from({ length: n }, (_, i) =>
      polarPt(cx, cy, r * frac, axisAngle(i)),
    );
    return { frac, points: toPolyPoints(pts) };
  });

  const spokes = Array.from({ length: n }, (_, i) => {
    const tip = polarPt(cx, cy, r, axisAngle(i));
    return { x1: cx, y1: cy, x2: tip.x, y2: tip.y };
  });

  const primaryPts = primaryAxes.map((axis, i) =>
    polarPt(cx, cy, r * clamp01(axis.value), axisAngle(i)),
  );
  const secondaryPts = secondaryAxes.map((axis, i) =>
    polarPt(cx, cy, r * clamp01(axis.value), axisAngle(i)),
  );

  const labelItems = primaryAxes.map((axis, i) => {
    const a = axisAngle(i);
    const p = polarPt(cx, cy, labelR, a);
    const cosA = Math.cos(a);
    const anchor: 'start' | 'middle' | 'end' =
      cosA > 0.15 ? 'start' : cosA < -0.15 ? 'end' : 'middle';
    const xNudge = cosA > 0.15 ? 4 : cosA < -0.15 ? 10 : 0;
    return { x: p.x + xNudge, y: p.y, label: axis.label, anchor };
  });

  const vb = computeTightViewBox(
    n,
    cx,
    cy,
    r,
    labelR,
    primaryAxes,
    secondaryAxes,
    labelItems,
  );
  const displayH = size * (vb.height / vb.width);

  return (
    <Svg
      width={size}
      height={displayH}
      viewBox={`${vb.minX} ${vb.minY} ${vb.width} ${vb.height}`}
    >
      {gridPolygons.map((g, i) => (
        <Polygon
          key={`grid-${i}`}
          points={g.points}
          fill="none"
          stroke={gridColor}
          strokeWidth={1}
        />
      ))}

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

      <Polygon
        points={toPolyPoints(secondaryPts)}
        fill={secondaryColor}
        fillOpacity={0.14}
        stroke={secondaryColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      <Polygon
        points={toPolyPoints(primaryPts)}
        fill={primaryColor}
        fillOpacity={0.2}
        stroke={primaryColor}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {secondaryPts.map((p, i) => (
        <Circle
          key={`dot-sec-${i}`}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill={secondaryColor}
        />
      ))}

      {primaryPts.map((p, i) => (
        <Circle
          key={`dot-pri-${i}`}
          cx={p.x}
          cy={p.y}
          r={4}
          fill={primaryColor}
        />
      ))}

      {labelItems.map((lbl, i) => (
        <SvgText
          key={`lbl-${i}`}
          x={lbl.x}
          y={lbl.y}
          textAnchor={lbl.anchor}
          fill={labelColor}
          fontSize={FONT_SIZE}
          fontWeight="600"
          dy="4"
        >
          {lbl.label}
        </SvgText>
      ))}
    </Svg>
  );
}
