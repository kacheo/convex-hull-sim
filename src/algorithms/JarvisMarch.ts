import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

export class JarvisMarch extends ConvexHullAlgo {
  private currentIndex = 0;
  private p!: Point;
  private q!: Point;
  private r!: Point;
  private done = false;

  protected init(): void {
    const leftmost = this.getLeftmostPoint();
    this.convexHullList = [leftmost];
    this.p = leftmost;
    this.q = this.pointList[0];
    this.r = this.pointList[0];
  }

  step(): void {
    if (this.done) return;
    this.stepNum++;

    if (this.currentIndex >= this.pointList.length) {
      // Finished scanning all points for current pivot
      this.convexHullList.push(this.q);

      if (this.q === this.convexHullList[0]) {
        this.done = true;
        return;
      }

      this.p = this.q;
      this.q = this.pointList[0];
      this.currentIndex = 0;
      return;
    }

    this.r = this.pointList[this.currentIndex];
    if (this.q === this.p || orientation(this.p, this.q, this.r) === Orientation.CounterClockwise) {
      this.q = this.r;
    }
    this.currentIndex++;
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
    if (this.done) return 'Jarvis March complete — hull found.';
    return `Jarvis March: scanning point ${this.currentIndex} of ${this.pointList.length} for next hull edge.`;
  }

  private getLeftmostPoint(): Point {
    let leftmost = this.pointList[0];
    for (const pt of this.pointList) {
      if (pt.x < leftmost.x) leftmost = pt;
    }
    return leftmost;
  }
}
