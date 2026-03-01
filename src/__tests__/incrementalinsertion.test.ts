import { describe, it, expect } from 'vitest';
import { IncrementalInsertion } from '../algorithms/IncrementalInsertion';
import {
  runToCompletion, isValidConvexHull, sameHullPoints,
  TRIANGLE, SQUARE, SQUARE_WITH_INTERIOR, COLLINEAR_PLUS_ONE, L_SHAPE, PENTAGON,
  EXPECTED_SQUARE_HULL, EXPECTED_L_SHAPE_HULL,
} from './helpers';

describe('IncrementalInsertion', () => {
  it('should find hull of triangle', () => {
    const algo = new IncrementalInsertion(TRIANGLE);
    const hull = runToCompletion(algo);
    expect(isValidConvexHull(hull, TRIANGLE)).toBe(true);
    expect(sameHullPoints(hull, TRIANGLE)).toBe(true);
  });

  it('should find hull of square', () => {
    const algo = new IncrementalInsertion(SQUARE);
    const hull = runToCompletion(algo);
    expect(isValidConvexHull(hull, SQUARE)).toBe(true);
    expect(sameHullPoints(hull, EXPECTED_SQUARE_HULL)).toBe(true);
  });

  it('should find hull of square with interior points', () => {
    const algo = new IncrementalInsertion(SQUARE_WITH_INTERIOR);
    const hull = runToCompletion(algo);
    expect(isValidConvexHull(hull, SQUARE_WITH_INTERIOR)).toBe(true);
    expect(sameHullPoints(hull, EXPECTED_SQUARE_HULL)).toBe(true);
  });

  it('should find hull of collinear + one point', () => {
    const algo = new IncrementalInsertion(COLLINEAR_PLUS_ONE);
    const hull = runToCompletion(algo);
    expect(isValidConvexHull(hull, COLLINEAR_PLUS_ONE)).toBe(true);
  });

  it('should find hull of L-shape', () => {
    const algo = new IncrementalInsertion(L_SHAPE);
    const hull = runToCompletion(algo);
    expect(isValidConvexHull(hull, L_SHAPE)).toBe(true);
    expect(sameHullPoints(hull, EXPECTED_L_SHAPE_HULL)).toBe(true);
  });

  it('should find hull of pentagon', () => {
    const algo = new IncrementalInsertion(PENTAGON);
    const hull = runToCompletion(algo);
    expect(isValidConvexHull(hull, PENTAGON)).toBe(true);
    expect(sameHullPoints(hull, PENTAGON)).toBe(true);
  });
});
