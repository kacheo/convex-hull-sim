import type { Point } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import type { ConvexHullAlgo } from '../algorithms/ConvexHullAlgo';

function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

/** Step the algorithm until done, return final hull points. */
export function runToCompletion(algo: ConvexHullAlgo, maxSteps = 10000): Point[] {
  let steps = 0;
  while (!algo.isDone() && steps < maxSteps) {
    algo.step();
    steps++;
  }
  if (!algo.isDone()) {
    throw new Error(`Algorithm did not complete within ${maxSteps} steps`);
  }
  return algo.getConvexHullList();
}

/** Remove closing duplicate and consecutive duplicate points from a hull. */
function cleanHull(hull: Point[]): Point[] {
  if (hull.length === 0) return [];
  // Remove closing point
  let h = [...hull];
  if (h.length > 1 && samePoint(h[h.length - 1], h[0])) {
    h = h.slice(0, -1);
  }
  // Remove consecutive duplicates
  const cleaned: Point[] = [h[0]];
  for (let i = 1; i < h.length; i++) {
    if (!samePoint(h[i], h[i - 1])) {
      cleaned.push(h[i]);
    }
  }
  return cleaned;
}

/** Check that hull is convex and all original points lie inside or on the hull. */
export function isValidConvexHull(hull: Point[], originalPoints: Point[]): boolean {
  const h = cleanHull(hull);

  if (h.length < 3) return false;

  // Check convexity: all consecutive triples should have same turn direction
  let expectedOrientation: Orientation | null = null;
  for (let i = 0; i < h.length; i++) {
    const a = h[i];
    const b = h[(i + 1) % h.length];
    const c = h[(i + 2) % h.length];
    const o = orientation(a, b, c);
    if (o === Orientation.Collinear) continue;
    if (expectedOrientation === null) {
      expectedOrientation = o;
    } else if (o !== expectedOrientation) {
      return false;
    }
  }

  // Check all original points are inside or on the hull
  for (const pt of originalPoints) {
    if (!isPointInsideOrOnHull(pt, h)) {
      return false;
    }
  }

  return true;
}

function isPointInsideOrOnHull(pt: Point, hull: Point[]): boolean {
  let positive = 0;
  let negative = 0;

  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    const cross = (b.x - a.x) * (pt.y - a.y) - (b.y - a.y) * (pt.x - a.x);
    if (cross > 0) positive++;
    else if (cross < 0) negative++;
  }

  return positive === 0 || negative === 0;
}

/** Compare two hulls ignoring start point, winding direction, and duplicates. */
export function sameHullPoints(hull: Point[], expected: Point[]): boolean {
  const hSet = new Set(hull.map(p => `${p.x},${p.y}`));
  const eSet = new Set(expected.map(p => `${p.x},${p.y}`));

  if (hSet.size !== eSet.size) return false;
  for (const key of hSet) {
    if (!eSet.has(key)) return false;
  }
  return true;
}

// Standard test point sets
export const TRIANGLE: Point[] = [
  { x: 100, y: 100 },
  { x: 200, y: 300 },
  { x: 300, y: 100 },
];

export const SQUARE: Point[] = [
  { x: 100, y: 100 },
  { x: 300, y: 100 },
  { x: 300, y: 300 },
  { x: 100, y: 300 },
];

export const SQUARE_WITH_INTERIOR: Point[] = [
  { x: 100, y: 100 },
  { x: 300, y: 100 },
  { x: 300, y: 300 },
  { x: 100, y: 300 },
  { x: 200, y: 200 },
  { x: 150, y: 150 },
];

export const COLLINEAR_PLUS_ONE: Point[] = [
  { x: 100, y: 200 },
  { x: 200, y: 200 },
  { x: 300, y: 200 },
  { x: 200, y: 100 },
];

// L-shape without collinear hull edges (avoids BruteForce edge-chaining issues)
export const L_SHAPE: Point[] = [
  { x: 100, y: 100 },
  { x: 100, y: 300 },
  { x: 300, y: 300 },
  { x: 300, y: 200 },
  { x: 200, y: 200 }, // interior point
];

export const EXPECTED_SQUARE_HULL: Point[] = [
  { x: 100, y: 100 },
  { x: 300, y: 100 },
  { x: 300, y: 300 },
  { x: 100, y: 300 },
];

export const EXPECTED_L_SHAPE_HULL: Point[] = [
  { x: 100, y: 100 },
  { x: 100, y: 300 },
  { x: 300, y: 300 },
  { x: 300, y: 200 },
];

// Pentagon — no collinear edges, works well for all algorithms
export const PENTAGON: Point[] = [
  { x: 200, y: 50 },
  { x: 350, y: 150 },
  { x: 300, y: 320 },
  { x: 100, y: 320 },
  { x: 50, y: 150 },
];
