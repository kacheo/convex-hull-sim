import { describe, it, expect } from 'vitest';
import { orientation } from '../primitives';
import { Orientation } from '../types';

describe('orientation', () => {
  it('should return Clockwise for screen-coordinate right turn (0,0)->(1,0)->(1,1)', () => {
    // Y-down: going right then down is a clockwise turn
    expect(orientation({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 })).toBe(Orientation.Clockwise);
  });

  it('should return CounterClockwise for screen-coordinate left turn (0,0)->(1,0)->(1,-1)', () => {
    // Y-down: going right then up is counter-clockwise
    expect(orientation({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 })).toBe(Orientation.CounterClockwise);
  });

  it('should return Collinear for three points on a line', () => {
    expect(orientation({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 })).toBe(Orientation.Collinear);
  });

  it('should return Collinear for identical points', () => {
    const p = { x: 5, y: 5 };
    expect(orientation(p, p, p)).toBe(Orientation.Collinear);
  });

  it('should handle vertical line (dx=0)', () => {
    expect(orientation({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 })).toBe(Orientation.CounterClockwise);
  });

  it('should handle horizontal line (dy=0)', () => {
    expect(orientation({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 })).toBe(Orientation.Collinear);
  });
});
