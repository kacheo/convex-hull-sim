import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

export class RandomIncremental extends ConvexHullAlgo {
  private i = 3;
  private done = false;
  private currentPoint!: Point;

  constructor(points: Point[]) {
    super(points);
    this.init();
  }

  protected init(): void {
    // Shuffle points
    for (let k = this.pointList.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [this.pointList[k], this.pointList[j]] = [this.pointList[j], this.pointList[k]];
    }

    // Find first 3 non-collinear points
    let found = false;
    for (let a = 0; a < this.pointList.length && !found; a++) {
      for (let b = a + 1; b < this.pointList.length && !found; b++) {
        for (let c = b + 1; c < this.pointList.length && !found; c++) {
          if (orientation(this.pointList[a], this.pointList[b], this.pointList[c]) !== Orientation.Collinear) {
            // Move these to positions 0, 1, 2
            const pts = [this.pointList[a], this.pointList[b], this.pointList[c]];
            this.pointList = this.pointList.filter((_, idx) => idx !== a && idx !== b && idx !== c);
            this.pointList.unshift(...pts);
            found = true;
          }
        }
      }
    }

    // Initialize hull as triangle (closed)
    const p0 = this.pointList[0];
    const p1 = this.pointList[1];
    const p2 = this.pointList[2];

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
      return;
    }
    this.stepNum++;

    this.currentPoint = this.pointList[this.i];

    // Check if point is outside hull
    if (this.isInsideHull(this.currentPoint)) {
      this.i++;
      return;
    }

    // Use edge visibility to find tangent points
    const hullLen = this.convexHullList.length - 1; // Exclude closing point

    // An edge is "visible" from the point if the point is on the CW side
    const visible: boolean[] = [];
    for (let k = 0; k < hullLen; k++) {
      const next = (k + 1) % hullLen;
      visible[k] = orientation(this.convexHullList[k], this.convexHullList[next], this.currentPoint) === Orientation.Clockwise;
    }

    // Find tangent points at visibility transitions
    let rightTangent = -1; // vertex where non-visible → visible
    let leftTangent = -1;  // vertex after visible → non-visible

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
      // Keep the non-visible arc from leftTangent to rightTangent, then add new point
      const newHull: Point[] = [];
      let idx = leftTangent;
      newHull.push(this.convexHullList[idx]);
      while (idx !== rightTangent) {
        idx = (idx + 1) % hullLen;
        newHull.push(this.convexHullList[idx]);
      }
      newHull.push(this.currentPoint);
      newHull.push(newHull[0]); // Close hull
      this.convexHullList = newHull;
    }

    this.i++;
  }

  private isInsideHull(pt: Point): boolean {
    // A point is inside if it's on the same side of all edges
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
    return null;
  }

  getCurrentStepPoints(): Point[] {
    if (!this.currentPoint) return [];
    return [this.currentPoint];
  }

  getDescription(): string {
    if (this.done) return 'Random Incremental complete — hull found.';
    return `Random Incremental: processing point ${this.i} of ${this.pointList.length}.`;
  }
}
