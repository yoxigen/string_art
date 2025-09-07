import { BoundingRect, Dimensions, SizeUnit } from '../types/general.types';

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
  return cm / INCH_TO_CM;
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
  return pixels / dpi;
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

export function mapDimensions(
  dimensions: Dimensions,
  mapper: (dimension: number) => number
): Dimensions {
  return dimensions.map(mapper) as Dimensions;
}

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
  return mapDimensions(dimensions, v => lengthConvert(v, from, to, dpi));
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

/**
 *
 * @param boundingRects Given multiple BoundingRects, returns a single BoundingRect that is like one ret bounding all rects
 */
export function combineBoundingRects(
  ...boundingRects: BoundingRect[]
): BoundingRect {
  return boundingRects.reduce(
    (box: BoundingRect, boundingRect: BoundingRect) => {
      const newBox = {
        ...box,
        left: !box.left
          ? boundingRect.left
          : Math.min(box.left, boundingRect.left),
        right: !box.right
          ? boundingRect.right
          : Math.max(box.right, boundingRect.right),
        top: !box.top ? boundingRect.top : Math.min(box.top, boundingRect.top),
        bottom: !boundingRect.bottom
          ? box.bottom
          : Math.max(box.bottom, boundingRect.bottom),
      };

      Object.assign(newBox, {
        width: newBox.right - newBox.left,
        height: newBox.bottom - newBox.top,
      });

      return newBox;
    },
    { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 }
  );
}
