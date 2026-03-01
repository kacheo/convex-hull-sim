export interface Point {
  x: number;
  y: number;
}

export interface Line {
  p1: Point;
  p2: Point;
}

export const Orientation = {
  Collinear: 0,
  CounterClockwise: 1,
  Clockwise: 2,
} as const;

export type Orientation = (typeof Orientation)[keyof typeof Orientation];
