import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

export class IncrementalInsertion extends ConvexHullAlgo {
  private i = 3;
  private done = false;
  private currentPoint!: Point;
  private tangentLine: Line | null = null;

  constructor(points: Point[]) {
    super(points);
    this.init();
  }

  protected init(): void {
    // Sort points by x, then by y
    this.pointList.sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);

    // Find first 3 non-collinear points
    let foundIdx = -1;
    for (let k = 2; k < this.pointList.length; k++) {
      if (orientation(this.pointList[0], this.pointList[1], this.pointList[k]) !== Orientation.Collinear) {
        foundIdx = k;
        break;
      }
    }

    if (foundIdx > 2) {
      // Swap to position 2
      [this.pointList[2], this.pointList[foundIdx]] = [this.pointList[foundIdx], this.pointList[2]];
    }

    const p0 = this.pointList[0];
    const p1 = this.pointList[1];
    const p2 = this.pointList[2];

    // Build initial triangle hull in CCW order
    if (orientation(p0, p1, p2) === Orientation.Clockwise) {
      this.convexHullList = [p0, p2, p1, p0];
    } else {
      this.convexHullList = [p0, p1, p2, p0];
    }

    this.currentPoint = this.pointList[Math.min(3, this.pointList.length - 1)];
  }

  step(): void {
    if (this.done) return;
    if (this.i >= this.pointList.length) {
      this.done = true;
      this.tangentLine = null;
      return;
    }
    this.stepNum++;

    this.currentPoint = this.pointList[this.i];

    if (this.isInsideHull(this.currentPoint)) {
      this.tangentLine = null;
      this.i++;
      return;
    }

    // Find visible edges and tangent points
    const hullLen = this.convexHullList.length - 1; // exclude closing point

    const visible: boolean[] = [];
    for (let k = 0; k < hullLen; k++) {
      const next = (k + 1) % hullLen;
      visible[k] = orientation(this.convexHullList[k], this.convexHullList[next], this.currentPoint) === Orientation.Clockwise;
    }

    let rightTangent = -1;
    let leftTangent = -1;

    for (let k = 0; k < hullLen; k++) {
      const prev = (k - 1 + hullLen) % hullLen;
      if (visible[k] && !visible[prev]) {
        rightTangent = k;
      }
      if (visible[k] && !visible[(k + 1) % hullLen]) {
        leftTangent = (k + 1) % hullLen;
      }
    }

    if (rightTangent >= 0 && leftTangent >= 0) {
      const newHull: Point[] = [];
      let idx = leftTangent;
      newHull.push(this.convexHullList[idx]);
      while (idx !== rightTangent) {
        idx = (idx + 1) % hullLen;
        newHull.push(this.convexHullList[idx]);
      }
      newHull.push(this.currentPoint);
      newHull.push(newHull[0]); // close
      this.convexHullList = newHull;

      this.tangentLine = {
        p1: this.convexHullList[rightTangent >= newHull.length - 1 ? 0 : 0],
        p2: this.currentPoint,
      };
    }

    this.tangentLine = { p1: this.convexHullList[0], p2: this.currentPoint };
    this.i++;
  }

  private isInsideHull(pt: Point): boolean {
    const hull = this.convexHullList;
    for (let k = 0; k < hull.length - 1; k++) {
      if (orientation(hull[k], hull[k + 1], pt) === Orientation.Clockwise) {
        return false;
      }
    }
    return true;
  }

  isDone(): boolean {
    return this.done;
  }

  getCurrentStepLine(): Line | null {
    return this.tangentLine;
  }

  getCurrentStepPoints(): Point[] {
    if (!this.currentPoint) return [];
    return [this.currentPoint];
  }

  getDescription(): string {
    if (this.done) return 'Incremental Insertion complete — hull found.';
    return `Incremental Insertion: processing point ${this.i} of ${this.pointList.length}.`;
  }
}
