import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

interface Segment {
  a: Point;
  b: Point;
  points: Point[]; // points on the left side of a→b
}

export class Quickhull extends ConvexHullAlgo {
  private done = false;
  private stack: Segment[] = [];
  private hullPoints: Point[] = [];
  private farthestPoint: Point | null = null;
  private stepLine: Line | null = null;

  constructor(points: Point[]) {
    super(points);
    this.init();
  }

  protected init(): void {
    // Find leftmost and rightmost points
    let left = this.pointList[0];
    let right = this.pointList[0];
    for (const pt of this.pointList) {
      if (pt.x < left.x || (pt.x === left.x && pt.y < left.y)) left = pt;
      if (pt.x > right.x || (pt.x === right.x && pt.y > right.y)) right = pt;
    }

    // Partition points into upper and lower sets
    const upper: Point[] = [];
    const lower: Point[] = [];
    for (const pt of this.pointList) {
      if (pt === left || pt === right) continue;
      const o = orientation(left, right, pt);
      if (o === Orientation.CounterClockwise) {
        upper.push(pt);
      } else if (o === Orientation.Clockwise) {
        lower.push(pt);
      }
    }

    this.hullPoints = [left, right];

    // Push segments to process (upper: left→right, lower: right→left)
    if (upper.length > 0) {
      this.stack.push({ a: left, b: right, points: upper });
    }
    if (lower.length > 0) {
      this.stack.push({ a: right, b: left, points: lower });
    }

    this.stepLine = { p1: left, p2: right };
  }

  step(): void {
    if (this.done) return;
    this.stepNum++;

    if (this.stack.length === 0) {
      this.done = true;
      this.buildFinalHull();
      this.stepLine = null;
      this.farthestPoint = null;
      return;
    }

    const seg = this.stack.pop()!;
    this.stepLine = { p1: seg.a, p2: seg.b };

    // Find farthest point from line a→b
    let maxDist = -1;
    let farthest: Point | null = null;
    for (const pt of seg.points) {
      const d = this.distFromLine(seg.a, seg.b, pt);
      if (d > maxDist) {
        maxDist = d;
        farthest = pt;
      }
    }

    if (farthest === null) {
      return;
    }

    this.farthestPoint = farthest;
    this.hullPoints.push(farthest);

    // Partition remaining points into two new segments
    const leftOfAF: Point[] = [];
    const leftOfFB: Point[] = [];
    for (const pt of seg.points) {
      if (pt === farthest) continue;
      if (orientation(seg.a, farthest, pt) === Orientation.CounterClockwise) {
        leftOfAF.push(pt);
      }
      if (orientation(farthest, seg.b, pt) === Orientation.CounterClockwise) {
        leftOfFB.push(pt);
      }
    }

    if (leftOfAF.length > 0) {
      this.stack.push({ a: seg.a, b: farthest, points: leftOfAF });
    }
    if (leftOfFB.length > 0) {
      this.stack.push({ a: farthest, b: seg.b, points: leftOfFB });
    }
  }

  private buildFinalHull(): void {
    // Order hull points in CCW order
    const pts = this.hullPoints;
    // Find centroid
    let cx = 0, cy = 0;
    for (const p of pts) { cx += p.x; cy += p.y; }
    cx /= pts.length; cy /= pts.length;

    // Sort by angle from centroid
    pts.sort((a, b) => {
      const angleA = Math.atan2(a.y - cy, a.x - cx);
      const angleB = Math.atan2(b.y - cy, b.x - cx);
      return angleA - angleB;
    });

    // Build closed hull
    this.convexHullList = [...pts, pts[0]];
  }

  private distFromLine(a: Point, b: Point, p: Point): number {
    return Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y));
  }

  isDone(): boolean {
    return this.done;
  }

  getCurrentStepLine(): Line | null {
    return this.stepLine;
  }

  getCurrentStepPoints(): Point[] {
    if (this.farthestPoint) return [this.farthestPoint];
    return [];
  }

  getDescription(): string {
    if (this.done) return 'Quickhull complete — hull found.';
    return `Quickhull: finding farthest point from current segment. ${this.stack.length} segments remaining.`;
  }
}
