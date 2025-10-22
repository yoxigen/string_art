import { describe, test, expect } from '@jest/globals';
import { combineBoundingRects, prettifyLength } from '../size_utils';

describe('Size utils', () => {
  describe('combineBoundingRects', () => {
    test('combines two bounding rects', () => {
      expect(
        combineBoundingRects(
          {
            top: 5,
            right: 10,
            bottom: 15,
            left: 2,
            width: 8,
            height: 10,
          },
          {
            top: 8,
            right: 17,
            bottom: 10,
            left: 3,
            width: 16,
            height: 2,
          }
        )
      ).toEqual({
        top: 5,
        right: 17,
        bottom: 15,
        left: 2,
        width: 15,
        height: 10,
      });
    });
  });

  describe('prettifyLength', () => {
    test('meters', () => {
      expect(prettifyLength(10, 'm')).toEqual('10 m');
    });

    test('rounded meters', () => {
      expect(prettifyLength(10.5, 'm')).toEqual('10.5 m');
    });

    test('cm', () => {
      expect(prettifyLength(0.25, 'm')).toEqual('25 cm');
    });

    test('rounded cm', () => {
      expect(prettifyLength(0.013, 'm')).toEqual('1.3 cm');
    });

    test('rounded cm', () => {
      expect(prettifyLength(0.013456, 'm', 2)).toEqual('1.35 cm');
    });

    test('mm', () => {
      expect(prettifyLength(0.002, 'm')).toEqual('2 mm');
    });

    test('mm', () => {
      expect(prettifyLength(0.0025, 'm')).toEqual('2.5 mm');
    });

    test('meters for source size cm', () => {
      expect(prettifyLength(1234, 'cm')).toEqual('12.3 m');
    });

    test('cm for source size cm', () => {
      expect(prettifyLength(4.512, 'cm')).toEqual('4.5 cm');
    });

    test('mm for source size cm', () => {
      expect(prettifyLength(0.41, 'cm')).toEqual('4.1 mm');
    });

    test('m for source size mm', () => {
      expect(prettifyLength(4123, 'mm')).toEqual('4.1 m');
    });

    test('cm for source size mm', () => {
      expect(prettifyLength(73.45, 'mm')).toEqual('7.3 cm');
    });
  });
});
