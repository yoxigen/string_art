import {
  BoundingRect,
  Coordinates,
  Dimensions,
  MetricLengthUnits,
  SizeUnit,
} from '../types/general.types';
import { roundNumber } from './math_utils';

export interface StandardSize {
  id: string;
  name?: string;
  dimensions: Dimensions;
}

const INCH_TO_CM = 2.54;

Object.defineProperty(Number.prototype, 'toFixedPrecision', {
  value: function (this: number, fractionDigits: number): number {
    const factor = Math.pow(10, fractionDigits);
    return Math.round(this * factor) / factor;
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
  mapper: (dimension: number, index?: number) => number
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

export function getBoundingRectForCoordinates(
  coordinates: ReadonlyArray<Coordinates>
): BoundingRect {
  if (coordinates.length === 0) {
    throw new Error("Can't get bounding rect, no coordinates specified.");
  }

  if (coordinates.length === 1) {
    return {
      top: coordinates[0][1],
      bottom: coordinates[0][1],
      left: coordinates[0][0],
      right: coordinates[0][0],
      width: 0,
      height: 0,
    };
  }
  const sides = coordinates.reduce(
    (box, point) => ({
      top: Math.min(box.top, point[1]),
      bottom: Math.max(box.bottom, point[1]),
      left: Math.min(box.left, point[0]),
      right: Math.max(box.right, point[0]),
    }),
    {
      top: Infinity,
      left: Infinity,
      bottom: -Infinity,
      right: -Infinity,
    }
  );

  return {
    ...sides,
    width: sides.right - sides.left,
    height: sides.bottom - sides.top,
  };
}

export function getBoundingRectAspectRatio(boundingRect: BoundingRect): number {
  return boundingRect.width / boundingRect.height;
}

/**
 * Fits the first size inside size2
 * @param {[number, number]} size1
 * @param {[number, number]} size2
 */
export function fitInside(size1: Dimensions, size2: Dimensions): Dimensions {
  const ratio = Math.min(size2[0] / size1[0], size2[1] / size1[1]);
  return mapDimensions(size1, v => v * ratio);
}

/**
 * Aligns the center of the  rect to the specified center, returns the first rect with different coordinates
 * @param rect1
 * @param rect2
 */
export function centerRect(
  size: Dimensions,
  center: Coordinates
): BoundingRect {
  const rectHalfSize = getCenter(size);

  return {
    width: size[0],
    height: size[1],
    left: center[0] - rectHalfSize[0],
    right: center[0] + rectHalfSize[0],
    top: center[1] - rectHalfSize[1],
    bottom: center[1] + rectHalfSize[1],
  };
}

/**
 * Returns the center coordinates of a plane, given its dimensions
 * @param size
 * @returns
 */
export function getCenter(size: Dimensions): Coordinates {
  return mapDimensions(size, v => v / 2);
}

const METRIC_UNITS = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
};

export function prettifyLength(
  length: number,
  sourceUnits: MetricLengthUnits,
  decimalPoints = 1
): string {
  const meters = length * METRIC_UNITS[sourceUnits];

  if (meters >= 1) {
    return roundNumber(meters, decimalPoints).toLocaleString() + ' m';
  } else if (meters < 0.01) {
    return roundNumber(meters * 1000, decimalPoints).toLocaleString() + ' mm';
  } else {
    return roundNumber(meters * 100, decimalPoints).toLocaleString() + ' cm';
  }
}
