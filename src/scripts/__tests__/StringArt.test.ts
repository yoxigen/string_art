import { describe, test, expect } from '@jest/globals';
import {
  createPatternInstance,
  getAllPatternsTypes,
} from '../helpers/pattern_utils';
import { TestRenderer } from '../renderers/TestRenderer';
import { Dimensions } from '../types/general.types';

const size: Dimensions = [1000, 1000];

describe('StringArt', () => {
  describe('draw patterns', () => {
    const patterns = getAllPatternsTypes();

    for (const pattern of patterns) {
      const renderer = new TestRenderer(size);
      test(`Draw ${pattern.name}`, () => {
        expect(() => pattern.draw(renderer)).not.toThrow();
      });
    }
  });

  test('draw to position', () => {
    const renderer = new TestRenderer(size);
    const starPattern = createPatternInstance('star');

    expect(starPattern.draw(renderer, { position: 20 })).not.toThrow();
  });

  describe('step count equals draw yields', () => {
    const patterns = getAllPatternsTypes();

    for (const pattern of patterns) {
      test(pattern.name, () => {
        const renderer = new TestRenderer(size);
        let drawCount = 0;
        pattern.initDraw(renderer);
        pattern.position = 0;
        const drawStringsGen = pattern.drawStrings(renderer);
        while (!drawStringsGen.next().done) {
          drawCount++;
        }

        expect(pattern.getStepCount({ size })).toEqual(drawCount);
      });
    }
  });
});
