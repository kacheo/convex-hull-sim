import type { Point, Line } from '../types';
import { orientation } from '../primitives';
import { Orientation } from '../types';
import { ConvexHullAlgo } from './ConvexHullAlgo';

type Phase = 'divide' | 'wait-children' | 'merge-upper' | 'merge-lower' | 'merge-done';

interface StackFrame {
  phase: Phase;
  points: Point[];
  leftHull: Point[] | null;
  rightHull: Point[] | null;
  upperLeft: number;
  upperRight: number;
  lowerLeft: number;
  lowerRight: number;
}

export class DivideAndConquer extends ConvexHullAlgo {
  private done = false;
  private stack: StackFrame[] = [];
  private resultStack: Point[][] = [];
  private stepLine: Line | null = null;
  private highlightPoints: Point[] = [];
  private descText = 'Divide & Conquer: initializing...';

  constructor(points: Point[]) {
    super(points);
    this.init();
  }

  protected init(): void {
    this.pointList.sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
    this.stack.push(this.makeFrame(this.pointList));
  }

  private makeFrame(points: Point[]): StackFrame {
    return {
      phase: 'divide',
      points: [...points],
      leftHull: null,
      rightHull: null,
      upperLeft: 0, upperRight: 0,
      lowerLeft: 0, lowerRight: 0,
    };
  }

  step(): void {
    if (this.done) return;
    this.stepNum++;

    if (this.stack.length === 0) {
      this.done = true;
      if (this.resultStack.length > 0) {
        const hull = this.resultStack.pop()!;
        this.convexHullList = [...hull, hull[0]];
      }
      this.stepLine = null;
      this.highlightPoints = [];
      this.descText = 'Divide & Conquer complete — hull found.';
      return;
    }

    const frame = this.stack[this.stack.length - 1];

    switch (frame.phase) {
      case 'divide': this.handleDivide(frame); break;
      case 'wait-children': this.handleWait(frame); break;
      case 'merge-upper': this.handleMergeUpper(frame); break;
      case 'merge-lower': this.handleMergeLower(frame); break;
      case 'merge-done': this.handleMergeDone(frame); break;
    }
  }

  private handleDivide(frame: StackFrame): void {
    const pts = frame.points;

    if (pts.length <= 3) {
      // Base case
      this.stack.pop();
      let hull: Point[];
      if (pts.length === 1) {
        hull = [pts[0]];
      } else if (pts.length === 2) {
        hull = [pts[0], pts[1]];
      } else {
        hull = orientation(pts[0], pts[1], pts[2]) === Orientation.Clockwise
          ? [pts[0], pts[2], pts[1]]
          : [pts[0], pts[1], pts[2]];
      }
      this.resultStack.push(hull);
      this.highlightPoints = hull;
      this.descText = `Divide & Conquer: base hull of ${hull.length} points.`;
      this.collectChildren();
      return;
    }

    // Split
    const mid = Math.floor(pts.length / 2);
    frame.phase = 'wait-children';

    // Push right child then left child (left processed first)
    this.stack.push(this.makeFrame(pts.slice(mid)));
    this.stack.push(this.makeFrame(pts.slice(0, mid)));

    this.descText = `Divide & Conquer: splitting ${pts.length} points.`;
    this.highlightPoints = pts;
  }

  private handleWait(_frame: StackFrame): void {
    this.collectChildren();
  }

  private collectChildren(): void {
    if (this.stack.length === 0) return;
    const parent = this.stack[this.stack.length - 1];
    if (parent.phase !== 'wait-children') return;

    if (parent.leftHull === null && this.resultStack.length >= 1) {
      parent.leftHull = this.resultStack.pop()!;
    }
    if (parent.leftHull !== null && parent.rightHull === null && this.resultStack.length >= 1) {
      parent.rightHull = this.resultStack.pop()!;
      this.initMerge(parent);
    }
  }

  private initMerge(frame: StackFrame): void {
    const left = frame.leftHull!;
    const right = frame.rightHull!;

    if (left.length <= 1 || right.length <= 1) {
      // Trivial merge
      frame.phase = 'merge-done';
      return;
    }

    // Find rightmost of left hull, leftmost of right hull
    let ri = 0;
    for (let i = 1; i < left.length; i++) {
      if (left[i].x > left[ri].x || (left[i].x === left[ri].x && left[i].y > left[ri].y)) ri = i;
    }
    let li = 0;
    for (let i = 1; i < right.length; i++) {
      if (right[i].x < right[li].x || (right[i].x === right[li].x && right[i].y < right[li].y)) li = i;
    }

    frame.upperLeft = ri;
    frame.upperRight = li;
    frame.lowerLeft = ri;
    frame.lowerRight = li;
    frame.phase = 'merge-upper';
    this.descText = 'Divide & Conquer: finding upper tangent.';
  }

  private handleMergeUpper(frame: StackFrame): void {
    const left = frame.leftHull!;
    const right = frame.rightHull!;
    const n = left.length;
    const m = right.length;
    let changed = false;

    // Move left index up (CCW)
    if (n >= 2) {
      const nextL = (frame.upperLeft + 1) % n;
      if (orientation(right[frame.upperRight], left[frame.upperLeft], left[nextL]) === Orientation.CounterClockwise) {
        frame.upperLeft = nextL;
        changed = true;
      }
    }

    // Move right index up (CW)
    if (m >= 2) {
      const prevR = (frame.upperRight - 1 + m) % m;
      if (orientation(left[frame.upperLeft], right[frame.upperRight], right[prevR]) === Orientation.Clockwise) {
        frame.upperRight = prevR;
        changed = true;
      }
    }

    this.stepLine = { p1: left[frame.upperLeft], p2: right[frame.upperRight] };
    this.highlightPoints = [...left, ...right];

    if (!changed) {
      frame.phase = 'merge-lower';
      this.descText = 'Divide & Conquer: finding lower tangent.';
    } else {
      this.descText = 'Divide & Conquer: adjusting upper tangent.';
    }
  }

  private handleMergeLower(frame: StackFrame): void {
    const left = frame.leftHull!;
    const right = frame.rightHull!;
    const n = left.length;
    const m = right.length;
    let changed = false;

    // Move left index down (CW)
    if (n >= 2) {
      const prevL = (frame.lowerLeft - 1 + n) % n;
      if (orientation(right[frame.lowerRight], left[frame.lowerLeft], left[prevL]) === Orientation.Clockwise) {
        frame.lowerLeft = prevL;
        changed = true;
      }
    }

    // Move right index down (CCW)
    if (m >= 2) {
      const nextR = (frame.lowerRight + 1) % m;
      if (orientation(left[frame.lowerLeft], right[frame.lowerRight], right[nextR]) === Orientation.CounterClockwise) {
        frame.lowerRight = nextR;
        changed = true;
      }
    }

    this.stepLine = { p1: left[frame.lowerLeft], p2: right[frame.lowerRight] };
    this.highlightPoints = [...left, ...right];

    if (!changed) {
      frame.phase = 'merge-done';
      this.descText = 'Divide & Conquer: tangents found. Merging hulls.';
    } else {
      this.descText = 'Divide & Conquer: adjusting lower tangent.';
    }
  }

  private handleMergeDone(frame: StackFrame): void {
    this.stack.pop();
    const left = frame.leftHull!;
    const right = frame.rightHull!;

    if (left.length <= 1 && right.length <= 1) {
      const merged = [...left, ...right];
      this.resultStack.push(merged);
      this.highlightPoints = merged;
      this.stepLine = null;
      this.collectChildren();
      return;
    }

    if (left.length <= 1) {
      this.resultStack.push(right);
      this.highlightPoints = right;
      this.convexHullList = [...right, right[0]];
      this.stepLine = null;
      this.collectChildren();
      return;
    }

    if (right.length <= 1) {
      // Insert the single right point into left hull
      const pt = right[0];
      // Check if inside
      let inside = true;
      for (let i = 0; i < left.length; i++) {
        const next = (i + 1) % left.length;
        if (orientation(left[i], left[next], pt) === Orientation.Clockwise) {
          inside = false;
          break;
        }
      }
      if (inside) {
        this.resultStack.push(left);
      } else {
        // Just add it and rebuild via simple approach
        const all = [...left, pt];
        this.resultStack.push(this.simpleHull(all));
      }
      this.stepLine = null;
      this.collectChildren();
      return;
    }

    // Merge using tangent indices
    const merged: Point[] = [];
    const n = left.length;
    const m = right.length;

    // Walk from upper-left tangent down (CW on left) to lower-left
    let idx = frame.upperLeft;
    merged.push(left[idx]);
    while (idx !== frame.lowerLeft) {
      idx = (idx - 1 + n) % n;
      merged.push(left[idx]);
    }

    // Walk from lower-right tangent up (CW on right) to upper-right
    idx = frame.lowerRight;
    merged.push(right[idx]);
    while (idx !== frame.upperRight) {
      idx = (idx - 1 + m) % m;
      merged.push(right[idx]);
    }

    this.resultStack.push(merged);
    this.highlightPoints = merged;
    this.convexHullList = [...merged, merged[0]];
    this.stepLine = null;
    this.descText = `Divide & Conquer: merged hull has ${merged.length} points.`;

    this.collectChildren();
  }

  private simpleHull(pts: Point[]): Point[] {
    // Graham scan for small sets
    const ref = pts.reduce((best, p) =>
      p.y > best.y || (p.y === best.y && p.x > best.x) ? p : best, pts[0]);
    const sorted = pts.filter(p => p !== ref).sort((a, b) => {
      const angleA = Math.atan2(ref.y - a.y, a.x - ref.x);
      const angleB = Math.atan2(ref.y - b.y, b.x - ref.x);
      return angleA - angleB;
    });
    const hull = [ref, sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      while (hull.length >= 2 && orientation(hull[hull.length - 2], hull[hull.length - 1], sorted[i]) === Orientation.Clockwise) {
        hull.pop();
      }
      hull.push(sorted[i]);
    }
    return hull;
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
