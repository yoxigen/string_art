import { describe, test, expect } from '@jest/globals';
import { TestRenderer } from '../../infra/renderers/TestRenderer';
import StarShape from '../StarShape';
import type { Dimensions } from '../../types/general.types';

describe('StarShape', () => {
  describe('step count is the same as number of yields for drawing a star', () => {
    const configs = [
      { sideNails: 20, sides: 3 },
      { sideNails: 21, sides: 3 },
      { sideNails: 20, sides: 4 },
      { sideNails: 21, sides: 4 },
    ];

    const size = [1000, 600] as Dimensions;
    const renderer = new TestRenderer(size);

    for (const config of configs) {
      const star = new StarShape({
        ...config,
        size,
      });
      const directions = star.getLayer().directions;
      let drawCount = -1; // The first direction isn't a step, it's a starting point
      while (!directions.next().done) {
        drawCount++;
      }

      test(`sideNails = ${config.sideNails}, sides = ${config.sides}`, () =>
        expect(star.getStepCount()).toEqual(drawCount));
    }
  });

  describe('getNailCount', () => {
    test('with center nail', () => {
      const star = new StarShape({
        sides: 3,
        sideNails: 10,
        size: [100, 100],
      });

      expect(star.getNailCount()).toBe(28);
    });

    test('without center nail', () => {
      const star = new StarShape({
        sides: 3,
        sideNails: 10,
        size: [100, 100],
        centerRadius: 20,
      });

      expect(star.getNailCount()).toBe(30);
    });
  });
});
