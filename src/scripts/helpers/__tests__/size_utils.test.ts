import { describe, test, expect } from '@jest/globals';
import { combineBoundingRects } from '../size_utils';

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
});
