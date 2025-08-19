import { describe, test, expect } from '@jest/globals';
import { compareObjects } from '../object_utils';

describe('object utils', () => {
  describe('compareObjects', () => {
    test('simple objects are equal', () => {
      const obj1 = { a: 1, b: 'two' };
      const obj2 = { a: 1, b: 'two' };

      expect(compareObjects(obj1, obj2)).toBe(true);
    });

    test('simple objects are not equal', () => {
      const obj1 = { a: 1, b: 'two' };
      const obj2 = { a: 2, b: 'two' };

      expect(compareObjects(obj1, obj2)).toBe(false);
    });

    test('deep-nested objets are equal', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };

      expect(compareObjects(obj1, obj2)).toBe(true);
    });

    test('deep-nested objects are not equal', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2, d: 3 } };

      expect(compareObjects(obj1, obj2)).toBe(false);
    });

    test('deep-nested objects with arrays are equal', () => {
      const obj1 = { a: 1, b: { c: [1, 2, 3] } };
      const obj2 = { a: 1, b: { c: [1, 2, 3] } };

      expect(compareObjects(obj1, obj2)).toBe(true);
    });

    test('deep-nested objects with different arrays are not equal', () => {
      const obj1 = { a: 1, b: { c: [1, 2, 3] } };
      const obj2 = { a: 1, b: { c: [1, 2] } };

      expect(compareObjects(obj1, obj2)).toBe(false);
    });

    test('simple objects with missing props in second obj are not equal', () => {
      const obj1 = { a: 1, b: 'two' };
      const obj2 = { a: 1 };

      expect(compareObjects(obj1, obj2)).toBe(false);
    });

    test('simple objects with missing props in first obj are not equal', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 1, b: 'two' };

      expect(compareObjects(obj1, obj2)).toBe(false);
    });

    test('simple objects with different types are not equal', () => {
      const obj1 = { a: true };
      const obj2 = { a: 'true' };

      expect(compareObjects(obj1, obj2)).toBe(false);
    });

    test('simple objects with different types of falsey values are not equal', () => {
      const obj1 = { a: null };
      const obj2 = { a: false };

      expect(compareObjects(obj1, obj2)).toBe(false);
    });

    test('null values are equal', () => {
      const obj1 = { a: null };
      const obj2 = { a: null };

      expect(compareObjects(obj1, obj2)).toBe(true);
    });

    test('missing prop makes objects not equal', () => {
      const obj1 = {};
      const obj2 = { a: null };

      expect(compareObjects(obj1, obj2)).toBe(false);
    });
  });
});
