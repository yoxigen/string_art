import { describe, test, expect } from '@jest/globals';
import { getDistanceBetweenCoordinates } from '../math_utils';

describe('Math utils', () => {
  describe('getDistanceBetweenCoordinates', () => {
    test('distance is correct for golden triangle', () => {
      expect(getDistanceBetweenCoordinates([0, 0], [3, 4])).toBe(5);
    });

    test('distance is correct in the opposite direction', () => {
      expect(getDistanceBetweenCoordinates([3, 4], [0, 0])).toBe(5);
    });
  });
});
