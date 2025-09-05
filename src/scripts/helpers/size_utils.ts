import { Dimensions, LengthUnit, SizeUnit } from '../types/general.types';

export interface StandardSize {
  id: string;
  name?: string;
  dimensions: Dimensions;
}

const INCH_TO_CM = 2.54;

Object.defineProperty(Number.prototype, 'toFixedPrecision', {
  value: function (this: number, fractionDigits: number): number {
    return parseFloat(this.toFixed(fractionDigits));
  },
  writable: true,
  configurable: true,
  enumerable: false, // Recommended for prototype extensions
});

export function areDimensionsEqual(d1: Dimensions, d2: Dimensions): boolean {
  return d1[0] === d2[0] && d1[1] === d2[1];
}

export function cmToPixels(cm: number, dpi = 300): number {
  return Math.floor((cm / INCH_TO_CM) * dpi);
}

export function cmToInch(cm: number): number {
  return (cm / INCH_TO_CM).toFixedPrecision(2);
}

export function inchToPixel(inch: number, dpi: number): number {
  return inch * dpi;
}

export function cmToPixel(cm: number, dpi: number): number {
  return inchToPixel(cmToInch(cm), dpi);
}

export function inchToCm(inch: number): number {
  return inch * INCH_TO_CM;
}

export function pixelsToInch(pixels: number, dpi: number): number {
  return (pixels / dpi).toFixedPrecision(2);
}

export function pixelsToCm(pixels: number, dpi: number): number {
  return inchToCm(pixelsToInch(pixels, dpi));
}

export function cmDimensionsToInch(dimensions: Dimensions): Dimensions {
  return dimensions.map(cmToInch) as Dimensions;
}

export function inchDimensionsToCm(dimensions: Dimensions): Dimensions {
  return dimensions.map(inchToCm) as Dimensions;
}

const LENGTH_UNITS: ReadonlySet<string> = new Set(['cm', 'inch']);

export function lengthConvert(
  value: number,
  from: SizeUnit,
  to: SizeUnit,
  dpi?: number
): number {
  if (from === to) {
    return value;
  }

  if (LENGTH_UNITS.has(from) !== LENGTH_UNITS.has(to) && !dpi) {
    throw new Error(`Can't convert from ${from} to ${to} without DPI!`);
  }

  switch (from) {
    case 'cm':
      switch (to) {
        case 'inch':
          return cmToInch(value);
        case 'px':
          return cmToPixel(value, dpi);
      }
    case 'inch':
      switch (to) {
        case 'cm':
          return inchToCm(value);
        case 'px':
          return inchToPixel(value, dpi);
      }
    case 'px':
      switch (to) {
        case 'cm':
          return pixelsToCm(value, dpi);
        case 'inch':
          return pixelsToInch(value, dpi);
      }
  }
}

export function sizeConvert(
  dimensions: Dimensions,
  from: SizeUnit,
  to: SizeUnit,
  dpi?: number
): Dimensions {
  return dimensions.map(v => lengthConvert(v, from, to, dpi)) as Dimensions;
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
