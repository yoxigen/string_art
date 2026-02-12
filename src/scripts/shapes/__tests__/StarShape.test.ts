import { describe, test, expect } from '@jest/globals';
import { TestRenderer } from '../../infra/renderers/TestRenderer';
import StarShape from '../StarShape';
import type { Dimensions } from '../../types/general.types';
import Nails from '../../infra/nails/Nails';
import Controller from '../../infra/Controller';

describe('StarShape', () => {
  describe('step count is the same as number of yields for drawing a star', () => {
    const configs = [
      { sideNails: 20, sides: 3 },
      { sideNails: 21, sides: 3 },
      { sideNails: 20, sides: 4 },
      { sideNails: 21, sides: 4 },
    ];

    const size = [1000, 600] as Dimensions;

    for (const config of configs) {
      const renderer = new TestRenderer(size);
      const nails = new Nails();
      const controller = new Controller(renderer, nails);
      const star = new StarShape({
        ...config,
        size,
      });
      star.addNails(nails);
      const directions = star.drawStar(controller);
      let drawCount = 0;
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
