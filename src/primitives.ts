import type { Point } from './types';
import { Orientation } from './types';

export function orientation(p: Point, q: Point, r: Point): Orientation {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val === 0) return Orientation.Collinear;
  return val > 0 ? Orientation.CounterClockwise : Orientation.Clockwise;
}
