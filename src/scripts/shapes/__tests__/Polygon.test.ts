import { describe, test, expect } from '@jest/globals';
import Polygon from '../Polygon';
import TestNails from '../../infra/nails/TestNails';

describe('Polygon', () => {
  test('getPoint 0', () => {
    const polygon = new Polygon({
      size: [100, 100],
      sides: 4,
      nailsPerSide: 10,
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

  describe('getNailCount', () => {
    test('getNailCount', () => {
      const polygon = new Polygon({
        size: [100, 100],
        sides: 3,
        nailsPerSide: 2,
        margin: 0,
        radiusNailsCountSameAsSides: true,
      });

      expect(polygon.getNailsCount()).toEqual(3);
    });

    test('getNailCount with center', () => {
      const polygon = new Polygon({
        size: [100, 100],
        sides: 3,
        nailsPerSide: 2,
        margin: 0,
        radiusNailsCountSameAsSides: true,
        drawCenter: true,
      });

      expect(polygon.getNailsCount()).toEqual(4);
    });

    test('getNailCount same as nails drawn', () => {
      const polygonWithCenter = new Polygon({
        size: [100, 100],
        sides: 3,
        nailsPerSide: 2,
        margin: 0,
        radiusNailsCountSameAsSides: true,
        drawCenter: true,
      });

      const nails = new TestNails();
      polygonWithCenter.drawNails(nails);
      expect(polygonWithCenter.getNailsCount()).toEqual(nails.nailCount);
    });
  });
});
