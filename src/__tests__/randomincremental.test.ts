import { describe, it, expect } from 'vitest';
import { RandomIncremental } from '../algorithms/RandomIncremental';
import {
  runToCompletion, isValidConvexHull, sameHullPoints,
  TRIANGLE, SQUARE, SQUARE_WITH_INTERIOR, PENTAGON,
  EXPECTED_SQUARE_HULL,
} from './helpers';

// Run multiple iterations due to random shuffle
const ITERATIONS = 5;

describe('RandomIncremental', () => {
  for (let iter = 0; iter < ITERATIONS; iter++) {
    it(`should find hull of triangle (iteration ${iter + 1})`, () => {
      const algo = new RandomIncremental(TRIANGLE);
      const hull = runToCompletion(algo);
      expect(isValidConvexHull(hull, TRIANGLE)).toBe(true);
      expect(sameHullPoints(hull, TRIANGLE)).toBe(true);
    });
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    it(`should find hull of square (iteration ${iter + 1})`, () => {
      const algo = new RandomIncremental(SQUARE);
      const hull = runToCompletion(algo);
      expect(isValidConvexHull(hull, SQUARE)).toBe(true);
      expect(sameHullPoints(hull, EXPECTED_SQUARE_HULL)).toBe(true);
    });
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    it(`should find hull of square with interior points (iteration ${iter + 1})`, () => {
      const algo = new RandomIncremental(SQUARE_WITH_INTERIOR);
      const hull = runToCompletion(algo);
      expect(isValidConvexHull(hull, SQUARE_WITH_INTERIOR)).toBe(true);
      expect(sameHullPoints(hull, EXPECTED_SQUARE_HULL)).toBe(true);
    });
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    it(`should find hull of pentagon (iteration ${iter + 1})`, () => {
      const algo = new RandomIncremental(PENTAGON);
      const hull = runToCompletion(algo);
      expect(isValidConvexHull(hull, PENTAGON)).toBe(true);
      expect(sameHullPoints(hull, PENTAGON)).toBe(true);
    });
  }
});
