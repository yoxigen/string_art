import { Dimensions } from '../types/general.types';

export interface StandardSize {
  id: string;
  dimensions: Dimensions;
}

const INCH_TO_CM = 2.54;

export function areDimensionsEqual(d1: Dimensions, d2: Dimensions): boolean {
  return d1[0] === d2[0] && d1[1] === d2[1];
}

export function cmToPixels(cm: number, dpi = 300): number {
  return Math.floor((cm / INCH_TO_CM) * dpi);
}

export const STANDARD_SIZES_CM: ReadonlyArray<StandardSize> = [
  {
    id: 'A4',
    dimensions: [21, 29.7],
  },
  {
    id: 'A3',
    dimensions: [29.7, 42],
  },
  {
    id: 'A2',
    dimensions: [42, 59.4],
  },
  {
    id: 'A1',
    dimensions: [59.4, 84.1],
  },
];
