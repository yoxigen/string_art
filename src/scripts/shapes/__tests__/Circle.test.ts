import { describe, test, expect } from '@jest/globals';
import Circle from '../Circle';
import { TestRenderer } from '../../infra/renderers/TestRenderer';
import Nails from '../../infra/nails/Nails';

describe('Circle', () => {
  describe('aspectRatio', () => {
    test('aspect ratio is correct for no distortion', () => {
      const circle = new Circle({
        n: 20,
        size: [100, 100],
      });

      expect(circle.getAspectRatio()).toBe(1);
    });

    test('aspect ratio is correct for negative distortion', () => {
      const circle = new Circle({
        n: 20,
        size: [100, 100],
        distortion: -0.5,
      });

      expect(circle.getAspectRatio()).toBe(0.5);
    });

    test('aspect ratio is correct for positive distortion', () => {
      const circle = new Circle({
        n: 20,
        size: [100, 100],
        distortion: 0.5,
      });

      expect(circle.getAspectRatio()).toBe(2);
    });
  });

  test('step count is the same as number of yields for drawing a ring', () => {
    const nails = new Nails();

    const circle = new Circle({
      n: 20,
      size: [1000, 600],
    });
    circle.drawNails(nails);
    const ringLayer = circle.getRingLayer({ ringSize: 2 });
    let drawCount = -1; // Starting at -1 because the first direction isn't a step, just the starting nail
    while (!ringLayer.directions.next().done) {
      drawCount++;
    }

    expect(circle.getRingStepCount()).toEqual(drawCount);
  });
});
