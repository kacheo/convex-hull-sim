import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

export class GrahamScan extends ConvexHullAlgo {
  private i = 2;
  private done = false;
  private lowestRightestPt!: Point;
  private p!: Point;
  private q!: Point;
  private r!: Point;

  protected init(): void {
    // Find lowest point (highest y in screen coords), rightmost on tie
    this.lowestRightestPt = this.pointList[0];
    for (const pt of this.pointList) {
      if (
        pt.y > this.lowestRightestPt.y ||
        (pt.y === this.lowestRightestPt.y && pt.x < this.lowestRightestPt.x)
      ) {
        this.lowestRightestPt = pt;
      }
    }

    // Sort by polar angle from lowestRightestPt
    const ref = this.lowestRightestPt;
    this.pointList.sort((a, b) => {
      if (a === ref) return 1;
      if (b === ref) return -1;

      let angleA = Math.atan(Math.abs(a.y - ref.y) / Math.abs(a.x - ref.x));
      if (a.x < ref.x) angleA = Math.PI - angleA;
      if (isNaN(angleA)) angleA = 0;

      let angleB = Math.atan(Math.abs(b.y - ref.y) / Math.abs(b.x - ref.x));
      if (b.x < ref.x) angleB = Math.PI - angleB;
      if (isNaN(angleB)) angleB = 0;

      return angleA - angleB;
    });

    // Initialize hull with first 3 sorted points
    this.convexHullList = [
      this.lowestRightestPt,
      this.pointList[0],
      this.pointList[1],
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
      this.convexHullList.push(this.lowestRightestPt);
      return;
    }

    const len = this.convexHullList.length;
    this.p = this.convexHullList[len - 2];
    this.q = this.convexHullList[len - 1];
    this.r = this.pointList[this.i];

    const o = orientation(this.p, this.q, this.r);
    if (o <= Orientation.CounterClockwise || this.i === this.pointList.length - 1) {
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
