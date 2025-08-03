import { insertAfter } from '../config_utils.js';
import { jest, describe, test } from '@jest/globals';
global.structuredClone = jest.fn(val => JSON.parse(JSON.stringify(val)));

describe('config utils', () => {
  test('inserts after the found control', () => {
    const config = [
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
    const config = [
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
    const config = [
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
