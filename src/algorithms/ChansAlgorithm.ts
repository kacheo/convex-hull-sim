import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

export class ChansAlgorithm extends ConvexHullAlgo {
  private done = false;
  private h = 2; // current guess for hull size
  private groups: Point[][] = [];
  private groupHulls: Point[][] = [];
  private phase: 'partition' | 'mini-hull' | 'jarvis' | 'done' = 'partition';
  private miniHullIdx = 0;
  private jarvisHull: Point[] = [];
  private jarvisCount = 0;
  private currentPivot!: Point;
  private bestCandidate!: Point;
  private groupScanIdx = 0;
  private stepLine: Line | null = null;
  private highlightPoints: Point[] = [];
  private descText = "Chan's Algorithm: initializing...";

  constructor(points: Point[]) {
    super(points);
    this.init();
  }

  protected init(): void {
    this.startRound();
  }

  private startRound(): void {
    // Partition points into groups of size h
    this.groups = [];
    for (let i = 0; i < this.pointList.length; i += this.h) {
      this.groups.push(this.pointList.slice(i, i + this.h));
    }
    this.groupHulls = [];
    this.miniHullIdx = 0;
    this.phase = 'mini-hull';
    this.descText = `Chan's: h=${this.h}, ${this.groups.length} groups. Computing mini-hulls.`;
  }

  step(): void {
    if (this.done) return;
    this.stepNum++;

    switch (this.phase) {
      case 'mini-hull': this.stepMiniHull(); break;
      case 'jarvis': this.stepJarvis(); break;
      case 'partition': this.startRound(); break;
      case 'done': break;
    }
  }

  private stepMiniHull(): void {
    if (this.miniHullIdx >= this.groups.length) {
      // All mini-hulls computed, start Jarvis
      this.startJarvis();
      return;
    }

    const group = this.groups[this.miniHullIdx];
    const hull = this.grahamScan(group);
    this.groupHulls.push(hull);
    this.highlightPoints = hull;
    this.descText = `Chan's: computed mini-hull ${this.miniHullIdx + 1}/${this.groups.length} (${hull.length} pts).`;
    this.miniHullIdx++;
  }

  private startJarvis(): void {
    // Find starting point (leftmost across all group hulls)
    let leftmost: Point | null = null;
    for (const hull of this.groupHulls) {
      for (const pt of hull) {
        if (leftmost === null || pt.x < leftmost.x || (pt.x === leftmost.x && pt.y < leftmost.y)) {
          leftmost = pt;
        }
      }
    }

    this.currentPivot = leftmost!;
    this.jarvisHull = [leftmost!];
    this.jarvisCount = 0;
    this.groupScanIdx = 0;
    this.bestCandidate = this.findInitialCandidate();
    this.phase = 'jarvis';
    this.descText = `Chan's: starting Jarvis March across group hulls.`;
  }

  private findInitialCandidate(): Point {
    // Find any point different from current pivot
    for (const hull of this.groupHulls) {
      for (const pt of hull) {
        if (pt !== this.currentPivot) return pt;
      }
    }
    return this.currentPivot;
  }

  private stepJarvis(): void {
    if (this.groupScanIdx >= this.groupHulls.length) {
      // Finished scanning all groups for this Jarvis step
      this.jarvisHull.push(this.bestCandidate);
      this.jarvisCount++;
      this.stepLine = { p1: this.currentPivot, p2: this.bestCandidate };

      if (this.bestCandidate === this.jarvisHull[0]) {
        // Completed the hull
        this.done = true;
        this.phase = 'done';
        this.convexHullList = [...this.jarvisHull];
        this.highlightPoints = [];
        this.descText = "Chan's Algorithm complete — hull found.";
        return;
      }

      if (this.jarvisCount >= this.h) {
        // h was too small, double and restart
        this.h = Math.min(this.h * 2, this.pointList.length);
        this.phase = 'partition';
        this.jarvisHull = [];
        this.jarvisCount = 0;
        this.stepLine = null;
        this.descText = `Chan's: h=${this.h / 2} too small, doubling to h=${this.h}.`;
        return;
      }

      this.currentPivot = this.bestCandidate;
      this.groupScanIdx = 0;
      this.bestCandidate = this.findInitialCandidate();
      return;
    }

    // Find tangent point from current pivot on this group hull
    const hull = this.groupHulls[this.groupScanIdx];
    const tangent = this.findTangent(this.currentPivot, hull);
    this.highlightPoints = hull;

    if (this.bestCandidate === this.currentPivot ||
        orientation(this.currentPivot, this.bestCandidate, tangent) === Orientation.CounterClockwise ||
        (orientation(this.currentPivot, this.bestCandidate, tangent) === Orientation.Collinear &&
         this.dist2(this.currentPivot, tangent) > this.dist2(this.currentPivot, this.bestCandidate))) {
      this.bestCandidate = tangent;
    }

    this.stepLine = { p1: this.currentPivot, p2: tangent };
    this.descText = `Chan's: Jarvis step ${this.jarvisCount + 1}, scanning group ${this.groupScanIdx + 1}/${this.groupHulls.length}.`;
    this.groupScanIdx++;
  }

  private findTangent(from: Point, hull: Point[]): Point {
    // Find the point on the hull that makes the smallest CCW angle from `from`
    // (i.e., the most clockwise point as seen from `from`)
    let best = hull[0];
    for (let i = 1; i < hull.length; i++) {
      const pt = hull[i];
      if (pt === from) continue;
      if (best === from) { best = pt; continue; }
      const o = orientation(from, best, pt);
      if (o === Orientation.CounterClockwise ||
          (o === Orientation.Collinear && this.dist2(from, pt) > this.dist2(from, best))) {
        best = pt;
      }
    }
    return best;
  }

  private grahamScan(pts: Point[]): Point[] {
    if (pts.length <= 2) return [...pts];

    // Find lowest-rightmost point
    let ref = pts[0];
    for (const pt of pts) {
      if (pt.y > ref.y || (pt.y === ref.y && pt.x > ref.x)) ref = pt;
    }

    const sorted = [...pts].sort((a, b) => {
      if (a === ref) return -1;
      if (b === ref) return 1;
      const angleA = Math.atan2(ref.y - a.y, a.x - ref.x);
      const angleB = Math.atan2(ref.y - b.y, b.x - ref.x);
      if (angleA !== angleB) return angleA - angleB;
      return this.dist2(ref, a) - this.dist2(ref, b);
    });

    const hull = [sorted[0], sorted[1]];
    for (let i = 2; i < sorted.length; i++) {
      while (hull.length >= 2 &&
             orientation(hull[hull.length - 2], hull[hull.length - 1], sorted[i]) === Orientation.Clockwise) {
        hull.pop();
      }
      hull.push(sorted[i]);
    }
    return hull;
  }

  private dist2(a: Point, b: Point): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  }

  isDone(): boolean {
    return this.done;
  }

  getCurrentStepLine(): Line | null {
    return this.stepLine;
  }

  getCurrentStepPoints(): Point[] {
    return this.highlightPoints;
  }

  getDescription(): string {
    return this.descText;
  }
}
