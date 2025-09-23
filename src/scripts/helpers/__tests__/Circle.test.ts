import { describe, test, expect } from '@jest/globals';
import Circle from '../../shapes/Circle';
import { TestRenderer } from '../../renderers/TestRenderer';

describe('Circle', () => {
  describe('aspectRatio', () => {
    test('aspect ratio is correct for no distortion', () => {
      const circle = new Circle({
        n: 20,
        size: [100, 100],
      });

      expect(circle.aspectRatio).toBe(1);
    });

    test('aspect ratio is correct for negative distortion', () => {
      const circle = new Circle({
        n: 20,
        size: [100, 100],
        distortion: -0.5,
      });

      expect(circle.aspectRatio).toBe(0.5);
    });

    test('aspect ratio is correct for positive distortion', () => {
      const circle = new Circle({
        n: 20,
        size: [100, 100],
        distortion: 0.5,
      });

      expect(circle.aspectRatio).toBe(2);
    });
  });

  test('step count is the same as number of yields for drawing a ring', () => {
    const renderer = new TestRenderer([1000, 600]);
    const circle = new Circle({
      n: 20,
      size: [1000, 600],
    });
    const drawRingGen = circle.drawRing(renderer, { ringSize: 2 });
    let drawCount = 0;
    while (!drawRingGen.next().done) {
      drawCount++;
    }

    expect(circle.getRingStepCount()).toEqual(drawCount);
  });
});
