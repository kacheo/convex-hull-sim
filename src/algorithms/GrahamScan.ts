import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

export class GrahamScan extends ConvexHullAlgo {
  private i = 3;
  private done = false;
  private lowestRightestPt!: Point;
  private p!: Point;
  private q!: Point;
  private r!: Point;

  constructor(points: Point[]) {
    super(points);
    this.init();
  }

  protected init(): void {
    // Find lowest point (highest y in screen coords), rightmost on tie
    this.lowestRightestPt = this.pointList[0];
    for (const pt of this.pointList) {
      if (
        pt.y > this.lowestRightestPt.y ||
        (pt.y === this.lowestRightestPt.y && pt.x > this.lowestRightestPt.x)
      ) {
        this.lowestRightestPt = pt;
      }
    }

    // Sort by polar angle from lowestRightestPt using atan2
    const ref = this.lowestRightestPt;
    this.pointList.sort((a, b) => {
      if (a === ref) return -1;
      if (b === ref) return 1;

      const angleA = Math.atan2(ref.y - a.y, a.x - ref.x);
      const angleB = Math.atan2(ref.y - b.y, b.x - ref.x);
      if (angleA !== angleB) return angleA - angleB;
      const distA = (a.x - ref.x) ** 2 + (a.y - ref.y) ** 2;
      const distB = (b.x - ref.x) ** 2 + (b.y - ref.y) ** 2;
      return distA - distB;
    });

    // Initialize hull with first 3 sorted points (ref is at index 0)
    this.convexHullList = [
      this.pointList[0],
      this.pointList[1],
      this.pointList[2],
    ];

    this.p = this.convexHullList[0];
    this.q = this.convexHullList[1];
    this.r = this.convexHullList[2];
  }

  step(): void {
    if (this.done) return;
    this.stepNum++;

    if (this.i >= this.pointList.length) {
      this.done = true;
      return;
    }

    const len = this.convexHullList.length;
    this.p = this.convexHullList[len - 2];
    this.q = this.convexHullList[len - 1];
    this.r = this.pointList[this.i];

    const o = orientation(this.p, this.q, this.r);
    if (o <= Orientation.CounterClockwise) {
      this.convexHullList.push(this.r);
      this.i++;
    } else if (o === Orientation.Clockwise) {
      // Right turn — remove last point
      this.convexHullList.splice(this.convexHullList.indexOf(this.q), 1);
    }
  }

  isDone(): boolean {
    return this.done;
  }

  getCurrentStepLine(): Line | null {
    return null;
  }

  getCurrentStepPoints(): Point[] {
    return [this.p, this.q, this.r, this.p];
  }

  getDescription(): string {
    if (this.done) return 'Graham Scan complete — hull found.';
    return `Graham Scan: evaluating point ${this.i} of ${this.pointList.length}.`;
  }
}
