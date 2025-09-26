import { describe, test, expect } from '@jest/globals';
import { TestRenderer } from '../../renderers/TestRenderer';
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
      const drawGen = star.drawStrings(renderer);
      let drawCount = 0;
      while (!drawGen.next().done) {
        drawCount++;
      }

      test(`sideNails = ${config.sideNails}, sides = ${config.sides}`, () =>
        expect(star.getStepCount()).toEqual(drawCount));
    }
  });
});
