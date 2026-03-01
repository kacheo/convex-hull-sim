import type { Point, Line } from '../types';

export abstract class ConvexHullAlgo {
  protected pointList: Point[];
  protected convexHullList: Point[];
  protected stepNum: number;

  constructor(points: Point[]) {
    if (points.length < 3) {
      throw new Error('Need at least 3 points');
    }
    this.pointList = [...points];
    this.convexHullList = [];
    this.stepNum = 0;
  }

  protected abstract init(): void;
  abstract step(): void;
  abstract isDone(): boolean;
  abstract getCurrentStepLine(): Line | null;
  abstract getCurrentStepPoints(): Point[];
  abstract getDescription(): string;

  getCurrentStep(): number {
    return this.stepNum;
  }

  getConvexHullList(): Point[] {
    return this.convexHullList;
  }
}
