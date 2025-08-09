import type { ControlsConfig } from '../../types/config.types';
import { getControlPath, insertAfter } from '../config_utils';
import { describe, test, expect } from '@jest/globals';

describe('config utils', () => {
  describe('insertAfter', () => {
    test('inserts after the found control', () => {
      const config: ControlsConfig = [
        {
          key: 'a',
          label: 'A',
          type: 'range',
          defaultValue: 0,
        },
        {
          key: 'c',
          label: 'C',
          type: 'range',
          defaultValue: 0,
        },
      ];

      const newConfig = insertAfter(config, 'a', [
        {
          key: 'b',
          label: 'B',
          type: 'range',
          defaultValue: 0,
        },
      ]);

      expect(newConfig).not.toBe(config);
      expect(newConfig).toEqual([
        {
          key: 'a',
          label: 'A',
          type: 'range',
          defaultValue: 0,
        },
        {
          key: 'b',
          label: 'B',
          type: 'range',
          defaultValue: 0,
        },
        {
          key: 'c',
          label: 'C',
          type: 'range',
          defaultValue: 0,
        },
      ]);
    });

    test('adds control in children', () => {
      const config: ControlsConfig = [
        {
          key: 'a',
          label: 'A',
          type: 'range',
        },
        {
          key: 'b',
          label: 'B',
          type: 'group',
          children: [
            {
              key: 'c',
              label: 'C',
              type: 'range',
            },
            {
              key: 'e',
              label: 'E',
              type: 'range',
            },
          ],
        },
      ];

      const newConfig = insertAfter(config, 'c', [
        {
          key: 'd',
          label: 'D',
          type: 'range',
        },
      ]);

      expect(newConfig).toEqual([
        {
          key: 'a',
          label: 'A',
          type: 'range',
        },
        {
          key: 'b',
          label: 'B',
          type: 'group',
          children: [
            {
              key: 'c',
              label: 'C',
              type: 'range',
            },
            {
              key: 'd',
              label: 'D',
              type: 'range',
            },
            {
              key: 'e',
              label: 'E',
              type: 'range',
            },
          ],
        },
      ]);
    });

    test('if node not found, returns original', () => {
      const config: ControlsConfig = [
        {
          key: 'a',
          label: 'A',
          type: 'range',
        },
      ];

      const newConfig = insertAfter(config, 'b', [
        {
          key: 'e',
          label: 'E',
          type: 'range',
        },
      ]);

      expect(newConfig).toEqual(config);
      expect(newConfig).toBe(config);
    });
  });

  describe('getControlPath', () => {
    test('gets path for flat config', () => {
      const config: ControlsConfig = [
        {
          key: 'a',
          label: 'A',
          type: 'range',
        },
        {
          key: 'b',
          label: 'B',
          type: 'range',
        },
      ];

      expect(getControlPath(config, 'b')).toEqual([1]);
    });

    test('gets path for config with children', () => {
      const config: ControlsConfig = [
        {
          key: 'a',
          label: 'A',
          type: 'range',
        },
        {
          key: 'b',
          label: 'B',
          type: 'group',
          children: [
            {
              key: 'c',
              label: 'C',
              type: 'range',
            },
            {
              key: 'd',
              label: 'D',
              type: 'group',
              children: [
                {
                  key: 'e',
                  label: 'E',
                  type: 'range',
                },
                {
                  key: 'f',
                  label: 'F',
                  type: 'range',
                },
              ],
            },
          ],
        },
      ];

      expect(getControlPath(config, 'f')).toEqual([1, 1, 1]);
    });
  });
});
