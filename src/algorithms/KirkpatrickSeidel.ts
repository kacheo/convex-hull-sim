import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

interface RecurseTask {
  points: Point[];
  leftBound: Point;
  rightBound: Point;
  isUpper: boolean;
}

export class KirkpatrickSeidel extends ConvexHullAlgo {
  private doneFlag = false;
  private upperHullPts: Point[] = [];
  private lowerHullPts: Point[] = [];
  private tasks: RecurseTask[] = [];
  private stepLine: Line | null = null;
  private highlightPoints: Point[] = [];
  private descText = 'Kirkpatrick-Seidel: initializing...';

  constructor(points: Point[]) {
    super(points);
    this.init();
  }

  protected init(): void {
    let left = this.pointList[0];
    let right = this.pointList[0];
    for (const pt of this.pointList) {
      if (pt.x < left.x || (pt.x === left.x && pt.y < left.y)) left = pt;
      if (pt.x > right.x || (pt.x === right.x && pt.y > right.y)) right = pt;
    }

    const upperPts = this.pointList.filter(p => {
      if (p === left || p === right) return true;
      return orientation(left, right, p) !== Orientation.Clockwise;
    });

    const lowerPts = this.pointList.filter(p => {
      if (p === left || p === right) return true;
      return orientation(left, right, p) !== Orientation.CounterClockwise;
    });

    this.tasks.push({ points: upperPts, leftBound: left, rightBound: right, isUpper: true });
    this.tasks.push({ points: lowerPts, leftBound: left, rightBound: right, isUpper: false });
  }

  step(): void {
    if (this.doneFlag) return;
    this.stepNum++;

    if (this.tasks.length === 0) {
      this.finalize();
      return;
    }

    const task = this.tasks.shift()!;
    this.processTask(task);
  }

  private processTask(task: RecurseTask): void {
    const { points, leftBound, rightBound, isUpper } = task;

    if (points.length <= 2 || this.samePoint(leftBound, rightBound)) {
      this.addHullPoint(leftBound, isUpper);
      this.addHullPoint(rightBound, isUpper);
      this.highlightPoints = [leftBound, rightBound];
      this.stepLine = { p1: leftBound, p2: rightBound };
      this.descText = `Kirkpatrick-Seidel: base case for ${isUpper ? 'upper' : 'lower'} hull.`;
      return;
    }

    // Find median x
    const xs = points.map(p => p.x).sort((a, b) => a - b);
    const medianX = xs[Math.floor(xs.length / 2)];

    const bridge = this.findBridge(points, medianX, isUpper);

    if (!bridge) {
      this.addHullPoint(leftBound, isUpper);
      this.addHullPoint(rightBound, isUpper);
      return;
    }

    const [bl, br] = bridge;
    this.addHullPoint(bl, isUpper);
    this.addHullPoint(br, isUpper);
    this.stepLine = { p1: bl, p2: br };
    this.highlightPoints = [bl, br];
    this.descText = `Kirkpatrick-Seidel: found ${isUpper ? 'upper' : 'lower'} bridge.`;

    // Recurse left
    if (!this.samePoint(bl, leftBound)) {
      const leftPts = points.filter(p => p.x < bl.x || this.samePoint(p, bl) || this.samePoint(p, leftBound));
      if (leftPts.length >= 2) {
        this.tasks.unshift({ points: leftPts, leftBound, rightBound: bl, isUpper });
      } else {
        this.addHullPoint(leftBound, isUpper);
      }
    }

    // Recurse right
    if (!this.samePoint(br, rightBound)) {
      const rightPts = points.filter(p => p.x > br.x || this.samePoint(p, br) || this.samePoint(p, rightBound));
      if (rightPts.length >= 2) {
        this.tasks.unshift({ points: rightPts, leftBound: br, rightBound, isUpper });
      } else {
        this.addHullPoint(rightBound, isUpper);
      }
    }
  }

  private findBridge(points: Point[], medianX: number, isUpper: boolean): [Point, Point] | null {
    let bestBridge: [Point, Point] | null = null;
    let bestY = isUpper ? Infinity : -Infinity;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        // Order so that left.x <= right.x
        let a = points[i], b = points[j];
        if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
          [a, b] = [b, a];
        }

        // Need one on each side of median
        if (!(a.x <= medianX && b.x >= medianX)) continue;

        // Check all other points are on the correct side of line a→b
        let valid = true;
        for (const p of points) {
          if (this.samePoint(p, a) || this.samePoint(p, b)) continue;
          const o = orientation(a, b, p);
          // Upper bridge: all others must NOT be CCW (must be CW or collinear = below or on)
          if (isUpper && o === Orientation.CounterClockwise) { valid = false; break; }
          // Lower bridge: all others must NOT be CW (must be CCW or collinear = above or on)
          if (!isUpper && o === Orientation.Clockwise) { valid = false; break; }
        }

        if (!valid) continue;

        let yAtMedian: number;
        if (a.x === b.x) {
          yAtMedian = isUpper ? Math.min(a.y, b.y) : Math.max(a.y, b.y);
        } else {
          yAtMedian = a.y + (b.y - a.y) * (medianX - a.x) / (b.x - a.x);
        }

        if (bestBridge === null ||
            (isUpper && yAtMedian < bestY) ||
            (!isUpper && yAtMedian > bestY)) {
          bestY = yAtMedian;
          bestBridge = [a, b];
        }
      }
    }

    return bestBridge;
  }

  private addHullPoint(pt: Point, isUpper: boolean): void {
    const list = isUpper ? this.upperHullPts : this.lowerHullPts;
    if (!list.some(p => p.x === pt.x && p.y === pt.y)) {
      list.push(pt);
    }
  }

  private samePoint(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  }

  private finalize(): void {
    this.upperHullPts.sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
    this.lowerHullPts.sort((a, b) => a.x !== b.x ? b.x - a.x : b.y - a.y);

    // Combine: upper left-to-right, then lower right-to-left (skip shared endpoints)
    const hull = [...this.upperHullPts];
    for (const p of this.lowerHullPts) {
      if (!hull.some(h => h.x === p.x && h.y === p.y)) {
        hull.push(p);
      }
    }

    if (hull.length > 0) {
      this.convexHullList = [...hull, hull[0]];
    }

    this.doneFlag = true;
    this.stepLine = null;
    this.highlightPoints = [];
    this.descText = 'Kirkpatrick-Seidel complete — hull found.';
  }

  isDone(): boolean {
    return this.doneFlag;
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
