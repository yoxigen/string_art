import { describe, test, expect } from '@jest/globals';
import Polygon from '../Polygon';

describe('Polygon', () => {
  test('getPoint 0', () => {
    const polygon = new Polygon({
      size: [100, 100],
      sides: 4,
      nailsSpacing: 0.1,
      margin: 0,
    });
    expect(polygon.getPoint(0)).toEqual(
      polygon.getSidePoint({ side: 0, index: 0 })
    );

    expect(polygon.getPoint(10)).toEqual(
      polygon.getSidePoint({ side: 1, index: 0 })
    );

    expect(polygon.getPoint(15)).toEqual(
      polygon.getSidePoint({ side: 1, index: 5 })
    );
  });
});
