import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

export class MonotoneChain extends ConvexHullAlgo {
  private upperHull: Point[] = [];
  private lowerHull: Point[] = [];
  private upperHullDone = false;
  private lowerHullDone = false;
  private i = 0;
  private p!: Point;
  private q!: Point;
  private r!: Point;

  constructor(points: Point[]) {
    super(points);
    this.init();
  }

  protected init(): void {
    // Sort by X, then by Y on tie
    this.pointList.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
    this.i = this.pointList.length - 1; // Start from rightmost for upper hull
    this.p = this.pointList[this.i];
    this.q = this.pointList[this.i];
    this.r = this.pointList[this.i];
  }

  step(): void {
    if (this.isDone()) return;
    this.stepNum++;

    if (!this.upperHullDone) {
      this.buildUpperHull();
    } else if (!this.lowerHullDone) {
      this.buildLowerHull();
    }
  }

  private buildUpperHull(): void {
    if (this.i < 0) {
      this.upperHullDone = true;
      this.i = 0;
      return;
    }

    const size = this.upperHull.length;
    if (
      size >= 2 &&
      orientation(
        this.upperHull[size - 1],
        this.upperHull[size - 2],
        this.pointList[this.i]
      ) <= Orientation.CounterClockwise
    ) {
      this.p = this.upperHull[size - 1];
      this.q = this.upperHull[size - 2];
      this.r = this.pointList[this.i];
      this.upperHull.splice(size - 1, 1);
    } else {
      this.r = this.pointList[this.i];
      this.upperHull.push(this.pointList[this.i]);
      this.p = this.upperHull[Math.max(0, this.upperHull.length - 2)];
      this.q = this.upperHull[this.upperHull.length - 1];
      this.i--;
    }

    this.convexHullList = [...this.upperHull];
  }

  private buildLowerHull(): void {
    if (this.i >= this.pointList.length) {
      this.lowerHullDone = true;

      // Remove duplicate endpoints
      if (this.lowerHull.length > 0 && this.upperHull.length > 0) {
        if (this.lowerHull[0] === this.upperHull[0]) {
          this.lowerHull.shift();
        }
        if (
          this.lowerHull.length > 0 &&
          this.lowerHull[this.lowerHull.length - 1] ===
            this.upperHull[this.upperHull.length - 1]
        ) {
          this.lowerHull.pop();
        }
      }

      this.convexHullList = [...this.lowerHull, ...this.upperHull];
      return;
    }

    const size = this.lowerHull.length;
    if (
      size >= 2 &&
      orientation(
        this.lowerHull[size - 1],
        this.lowerHull[size - 2],
        this.pointList[this.i]
      ) <= Orientation.CounterClockwise
    ) {
      this.p = this.lowerHull[size - 1];
      this.q = this.lowerHull[size - 2];
      this.r = this.pointList[this.i];
      this.lowerHull.splice(size - 1, 1);
    } else {
      this.r = this.pointList[this.i];
      this.lowerHull.push(this.pointList[this.i]);
      this.p = this.lowerHull[Math.max(0, this.lowerHull.length - 2)];
      this.q = this.lowerHull[this.lowerHull.length - 1];
      this.i++;
    }

    this.convexHullList = [...this.lowerHull, ...this.upperHull];
  }

  isDone(): boolean {
    return this.upperHullDone && this.lowerHullDone;
  }

  getCurrentStepLine(): Line | null {
    return null;
  }

  getCurrentStepPoints(): Point[] {
    return [this.p, this.q, this.r, this.p];
  }

  getDescription(): string {
    if (this.isDone()) return 'Monotone Chain complete — hull found.';
    if (!this.upperHullDone) return `Monotone Chain: building upper hull.`;
    return `Monotone Chain: building lower hull.`;
  }
}
