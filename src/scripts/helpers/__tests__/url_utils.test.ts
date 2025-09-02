import { describe, test, expect } from '@jest/globals';
import Lotus from '../../string_art_types/Lotus';
import { getPatternURL } from '../url_utils';

describe('url utils', () => {
  describe('getPatternURL', () => {
    test('returns the correct URL for a template', () => {
      const pattern = new Lotus();
      pattern.config = {
        sides: 9,
        density: 88,
      };

      expect(getPatternURL(pattern)).toEqual('?pattern=lotus&config=9_88');
    });

    test('returns the correct URL for a saved pattern', () => {
      const pattern = new Lotus();
      pattern.config = {
        sides: 9,
        density: 88,
      };
      pattern.id = '1';

      expect(getPatternURL(pattern, { patternAsTemplate: true })).toEqual(
        '?pattern=lotus&config=9_88'
      );
    });

    test('returns the correct URL with svg renderer', () => {
      const pattern = new Lotus();
      pattern.config = {
        sides: 9,
        density: 88,
      };

      expect(getPatternURL(pattern, { renderer: 'svg' })).toEqual(
        '?pattern=lotus&config=9_88&renderer=svg'
      );
    });

    test('does not replace id for template if not required', () => {
      const pattern = new Lotus();
      pattern.config = {
        sides: 9,
        density: 88,
      };
      pattern.id = '1';

      expect(getPatternURL(pattern, { patternAsTemplate: false })).toEqual(
        '?pattern=1&config=9_88'
      );

      expect(getPatternURL(pattern)).toEqual('?pattern=1&config=9_88');
    });
  });
});
