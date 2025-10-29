import { describe, test, expect } from '@jest/globals';
import {
  createPatternInstance,
  getAllPatternsTypes,
} from '../../helpers/pattern_utils';
import { TestRenderer } from '../renderers/TestRenderer';
import { Dimensions } from '../../types/general.types';
import type StringArt from '../StringArt';
import { MeasureRenderer } from '../renderers/MeasureRenderer';

const size: Dimensions = [100, 100];

describe('StringArt', () => {
  describe('patterns', () => {
    let patterns = getAllPatternsTypes();

    for (const pattern of patterns) {
      const renderer = new TestRenderer(size);
      test(`Draw ${pattern.name}`, () => {
        expect(() => pattern.draw(renderer)).not.toThrow();
      });

      describe('getNailsCount', () => {
        const measureRenderer = new MeasureRenderer(size);
        test(`${pattern.name} getNailCount`, () => {
          pattern.draw(measureRenderer);
          expect(pattern.getNailCount(size)).toEqual(measureRenderer.nailCount);
        });

        if (pattern.testStepCountConfig) {
          let testId = 2;
          for (const testConfig of pattern.testStepCountConfig) {
            test(`${pattern.name} getNailCount #${testId}`, () => {
              const patternConfig = pattern.copy();
              patternConfig.assignConfig(testConfig);
              patternConfig.draw(measureRenderer, { redrawNails: true });
              expect(patternConfig.getNailCount(size)).toEqual(
                measureRenderer.nailCount
              );
            });
            testId++;
          }
        }
      });
    }
  });

  test('draw to position', () => {
    const renderer = new TestRenderer(size);
    const starPattern = createPatternInstance('star');

    expect(starPattern.draw(renderer, { position: 20 })).not.toThrow();
  });

  describe('getAspectRatio', () => {
    const patterns = getAllPatternsTypes();
    for (const pattern of patterns) {
      test(`getAspectRatio ${pattern.name}`, () => {
        expect(pattern.getAspectRatio({ size })).not.toBeNaN();
      });
    }
  });

  describe('step count equals draw yields', () => {
    const patterns = getAllPatternsTypes();

    function testPatternStepCount(pattern: StringArt) {
      const renderer = new TestRenderer(size);
      let drawCount = 0;
      pattern.initDraw(renderer);
      pattern.position = 0;
      const drawStringsGen = pattern.drawStrings(renderer);
      while (!drawStringsGen.next().done) {
        drawCount++;
      }

      expect(pattern.getStepCount({ size })).toEqual(drawCount);
    }

    for (const pattern of patterns) {
      test(pattern.name + ' default config', () => {
        testPatternStepCount(pattern);
      });

      if (pattern.testStepCountConfig != null) {
        describe(`${pattern.name} additional configs`, () => {
          let testId = 1;

          for (const testConfig of pattern.testStepCountConfig) {
            test('config #' + testId, () => {
              const patternConfig = pattern.copy();
              patternConfig.assignConfig(testConfig);
              testPatternStepCount(patternConfig);
            });
            testId++;
          }
        });
      }
    }
  });
});
