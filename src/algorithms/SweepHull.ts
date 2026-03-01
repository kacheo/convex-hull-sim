import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

export class SweepHull extends ConvexHullAlgo {
  private i = 3;
  private tangentIndex = 0;
  private done = false;
  private topTangentDone = false;
  private lowerTangentDone = false;
  private tRm!: Point;
  private lRm!: Point;
  private p!: Point;
  private q!: Point;
  private r!: Point;
  private canvasHeight = 0;

  constructor(points: Point[], canvasHeight: number) {
    super(points);
    this.canvasHeight = canvasHeight;
  }

  protected init(): void {
    // Sort by X
    this.pointList.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

    // Initialize with first 3 points in clockwise order
    const p0 = this.pointList[0];
    const p1 = this.pointList[1];
    const p2 = this.pointList[2];

    if (orientation(p0, p1, p2) === Orientation.CounterClockwise) {
      this.convexHullList = [p0, p2, p1, p0];
    } else {
      this.convexHullList = [p0, p1, p2, p0];
    }

    this.p = p0;
    this.q = p1;
    this.r = p2;
  }

  step(): void {
    if (this.done) return;
    if (this.i >= this.pointList.length) {
      this.done = true;
      return;
    }
    this.stepNum++;

    this.r = this.pointList[this.i];

    if (!this.topTangentDone) {
      this.p = this.convexHullList[this.tangentIndex];
      this.q = this.convexHullList[this.tangentIndex + 1];

      if (
        orientation(this.p, this.q, this.r) <= Orientation.CounterClockwise
      ) {
        this.tRm = this.convexHullList[this.tangentIndex + 1];
        this.topTangentDone = true;
        this.tangentIndex = this.convexHullList.length - 1;
      } else {
        this.tangentIndex++;
      }
    } else if (!this.lowerTangentDone) {
      this.p = this.convexHullList[this.tangentIndex];
      this.q = this.convexHullList[this.tangentIndex - 1];

      const o = orientation(this.p, this.q, this.r);
      if (o === Orientation.Clockwise || o === Orientation.Collinear) {
        this.lRm = this.convexHullList[this.tangentIndex - 1];
        this.lowerTangentDone = true;

        // Remove points between tangents and insert new point
        if (this.tRm === this.lRm) {
          const idx = this.convexHullList.indexOf(this.tRm);
          this.convexHullList.splice(idx, 1, this.r);
        } else {
          const tIndex = this.convexHullList.indexOf(this.tRm);
          const lIndex = this.convexHullList.indexOf(this.lRm);
          const count = lIndex - tIndex + 1;
          this.convexHullList.splice(tIndex, count, this.r);
        }

        this.tangentIndex = 0;
      } else {
        this.tangentIndex--;
      }
    } else {
      // Both tangents found, move to next point
      this.i++;
      this.topTangentDone = false;
      this.lowerTangentDone = false;
    }
  }

  isDone(): boolean {
    return this.done;
  }

  getCurrentStepLine(): Line | null {
    if (this.i >= this.pointList.length) return null;
    const x = this.pointList[this.i].x;
    return { p1: { x, y: 0 }, p2: { x, y: this.canvasHeight } };
  }

  getCurrentStepPoints(): Point[] {
    return [this.p, this.q, this.r, this.p];
  }

  getDescription(): string {
    if (this.done) return 'Sweep Hull complete — hull found.';
    if (!this.topTangentDone) return `Sweep Hull: finding upper tangent for point ${this.i}.`;
    if (!this.lowerTangentDone) return `Sweep Hull: finding lower tangent for point ${this.i}.`;
    return `Sweep Hull: advancing to next point.`;
  }
}
