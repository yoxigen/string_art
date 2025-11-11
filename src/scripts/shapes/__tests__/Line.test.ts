import { describe, test, expect } from '@jest/globals';
import { Line } from '../Line';

describe('Line', () => {
  describe('getBoundingRect', () => {
    test('returns the correct bounding rect for regular config', () => {
      const line = new Line({
        from: [0, 0],
        to: [4, 4],
        n: 10,
      });

      expect(line.getBoundingRect()).toEqual({
        top: 0,
        bottom: 4,
        width: 4,
        height: 4,
        left: 0,
        right: 4,
      });
    });

    test('returns the correct bounding rect for line with rotation', () => {
      const line = new Line({
        from: [0, 0],
        to: [4, 0],
        n: 10,
        rotation: 1 / 4, // rotating by 90 degrees to have convenient test values
        rotationCenter: 'from',
      });

      expect(line.getBoundingRect()).toEqual({
        top: 0,
        bottom: 4,
        width: 0,
        height: 4,
        left: 0,
        right: 0,
      });
    });
  });

  describe('getNailCount', () => {
    test('regular count', () => {
      const line = new Line({
        from: [0, 1],
        to: [2, 3],
        n: 4,
      });

      expect(line.getNailCount()).toEqual(4);
    });

    test('with start index', () => {
      const line = new Line({
        from: [0, 1],
        to: [2, 3],
        n: 4,
        drawStartIndex: 2,
      });

      expect(line.getNailCount()).toEqual(2);
    });

    test('with end index', () => {
      const line = new Line({
        from: [0, 1],
        to: [2, 3],
        n: 4,
        drawEndIndex: 2,
      });

      expect(line.getNailCount()).toEqual(3);
    });

    test('with start and end index', () => {
      const line = new Line({
        from: [0, 1],
        to: [2, 3],
        n: 10,
        drawStartIndex: 1,
        drawEndIndex: 8,
      });

      expect(line.getNailCount()).toEqual(8);
    });
  });
});
