import { describe, test, expect } from '@jest/globals';
import Polygon from '../Polygon';
import { MeasureRenderer } from '../../renderers/MeasureRenderer';
import TestNails from '../../TestNails';

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
    const polygon = new Polygon({
      size: [100, 100],
      sides: 3,
      nailsPerSide: 2,
      margin: 0,
      radiusNailsCountSameAsSides: true,
    });

    test('getNailCount', () => {
      const nails = new TestNails();
      polygon.drawNails(nails);
      expect(polygon.getNailsCount()).toEqual(nails.nailCount);
    });

    test('getNailCount with center', () => {
      const nails = new TestNails();
      polygon.drawNails(nails, { drawCenter: true });
      expect(polygon.getNailsCount({ drawCenter: true })).toEqual(
        nails.nailCount
      );
    });
  });
});
