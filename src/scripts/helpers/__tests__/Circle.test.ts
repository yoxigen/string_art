import { describe, test, expect } from '@jest/globals';
import Circle from '../../shapes/Circle';

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
});
