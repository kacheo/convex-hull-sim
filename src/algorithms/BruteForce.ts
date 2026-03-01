import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

export class BruteForce extends ConvexHullAlgo {
  private i = 0;
  private j = 1;
  private done = false;
  private hullEdges: [Point, Point][] = [];
  private currentP!: Point;
  private currentQ!: Point;

  constructor(points: Point[]) {
    super(points);
    this.init();
  }

  protected init(): void {
    this.currentP = this.pointList[0];
    this.currentQ = this.pointList[1];
  }

  step(): void {
    if (this.done) return;
    this.stepNum++;

    this.currentP = this.pointList[this.i];
    this.currentQ = this.pointList[this.j];

    // Check if all other points are on the same side of edge (p, q)
    let allLeft = true;
    let allRight = true;

    for (let k = 0; k < this.pointList.length; k++) {
      if (k === this.i || k === this.j) continue;
      const o = orientation(this.currentP, this.currentQ, this.pointList[k]);
      if (o === Orientation.CounterClockwise) allRight = false;
      else if (o === Orientation.Clockwise) allLeft = false;
    }

    if (allLeft || allRight) {
      this.hullEdges.push([this.currentP, this.currentQ]);
      this.buildHullFromEdges();
    }

    // Advance to next pair
    this.j++;
    if (this.j >= this.pointList.length) {
      this.i++;
      this.j = this.i + 1;
    }
    if (this.i >= this.pointList.length - 1) {
      this.done = true;
      this.buildHullFromEdges();
    }
  }

  private buildHullFromEdges(): void {
    if (this.hullEdges.length === 0) return;

    // Build ordered hull from unordered edges
    const edges = [...this.hullEdges];
    const hull: Point[] = [edges[0][0], edges[0][1]];
    const used = new Set<number>([0]);

    while (used.size < edges.length) {
      const last = hull[hull.length - 1];
      let found = false;
      for (let e = 0; e < edges.length; e++) {
        if (used.has(e)) continue;
        if (edges[e][0] === last) {
          hull.push(edges[e][1]);
          used.add(e);
          found = true;
          break;
        } else if (edges[e][1] === last) {
          hull.push(edges[e][0]);
          used.add(e);
          found = true;
          break;
        }
      }
      if (!found) break;
    }

    if (hull.length > 1 && hull[hull.length - 1] !== hull[0]) {
      hull.push(hull[0]);
    }
    this.convexHullList = hull;
  }

  isDone(): boolean {
    return this.done;
  }

  getCurrentStepLine(): Line | null {
    return null;
  }

  getCurrentStepPoints(): Point[] {
    return [this.currentP, this.currentQ];
  }

  getDescription(): string {
    if (this.done) return 'Brute Force complete — hull found.';
    return `Brute Force: testing edge (${this.i}, ${this.j}) — found ${this.hullEdges.length} hull edges.`;
  }
}
