import { describe, it, expect } from 'vitest';
import { RandomIncremental } from '../algorithms/RandomIncremental';
import {
  runToCompletion, isValidConvexHull, sameHullPoints,
  TRIANGLE,
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
});
