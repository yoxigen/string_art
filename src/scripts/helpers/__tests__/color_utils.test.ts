import { describe, test, expect } from '@jest/globals';
import { convertColorFormat } from '../color_utils';

describe('convertColorFormat', () => {
  describe('HEX input', () => {
    test('converts hex to rgb', () => {
      const result = convertColorFormat('#ff0000', 'rgb');
      expect(result).toBe('rgb(255, 0, 0)');
    });

    test('converts hex to hsl', () => {
      const result = convertColorFormat('#00ff00', 'hsl');
      expect(result).toBe('hsl(120, 100%, 50%)');
    });
  });

  describe('RGB input', () => {
    test('converts rgb to hex', () => {
      const result = convertColorFormat('rgb(0, 0, 255)', 'hex');
      expect(result).toBe('#0000ff');
    });

    test('converts rgb to hsl', () => {
      const result = convertColorFormat('rgb(255, 255, 0)', 'hsl');
      expect(result).toBe('hsl(60, 100%, 50%)');
    });
  });

  describe('HSL input', () => {
    test('converts hsl to rgb', () => {
      const result = convertColorFormat('hsl(240, 100%, 50%)', 'rgb');
      expect(result).toBe('rgb(0, 0, 255)');
    });

    test('converts hsl to hex', () => {
      const result = convertColorFormat('hsl(0, 100%, 50%)', 'hex');
      expect(result).toBe('#ff0000');
    });

    test('converts hsl with decimal point to hex', () => {
      const result = convertColorFormat('hsl(0.5, 100%, 50%)', 'hex');
      expect(result).toBe('#ff0200');
    });
  });

  describe('edge cases', () => {
    test('returns the same format if target equals source', () => {
      const result = convertColorFormat('#abcdef', 'hex');
      expect(result).toBe('#abcdef');
    });
  });
});
