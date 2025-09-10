import {
  fitInside,
  mapDimensions,
  STANDARD_SIZES_CM,
} from '../../../helpers/size_utils';
import { Dimensions, SizeUnit } from '../../../types/general.types';

export interface DownloadSizeType {
  id: string;
  name?: string;
  dimensions?:
    | Dimensions
    | ((options: {
        customDimensions: Dimensions | null;
        currentDimensions: Dimensions | null;
        patternAspectRatio: number;
      }) => Dimensions | null);
  units?: SizeUnit[];
  aspectRatio?:
    | number
    | ((options: { patternAspectRatio: number }) => number | null);
  allowSizeEdit?: boolean;
  defaultUnits?: SizeUnit;
  inUnits?: SizeUnit;
  defaultMargin?: number;
  allowRotate?: boolean;
}

const DEFAULT_DIMENSIONS: Dimensions = [10, 10];

export const DOWNLOAD_IMAGE_SIZES: ReadonlyArray<DownloadSizeType> = [
  {
    id: 'fit',
    name: 'Fit pattern',
    dimensions: ({ customDimensions, patternAspectRatio }) => {
      let dimensions = customDimensions;
      if (!dimensions) {
        const SMALL_SCREEN_DIMENSION = Math.min(screen.width, screen.height);
        const dpr = window.devicePixelRatio ?? 1;
        dimensions = mapDimensions(
          [SMALL_SCREEN_DIMENSION, SMALL_SCREEN_DIMENSION],
          v => v * dpr
        );
      }
      const customDimensionsFitPattern = [
        dimensions[0],
        dimensions[0] / patternAspectRatio,
      ] as Dimensions;

      return fitInside(customDimensionsFitPattern, dimensions);
    },
    units: ['px', 'cm', 'inch'],
    defaultUnits: 'px',
    defaultMargin: 20,
    allowSizeEdit: true,
    aspectRatio: ({ patternAspectRatio }) => patternAspectRatio,
  },
  {
    id: 'screen',
    name: 'Screen size',
    dimensions: () => {
      const dpr = window.devicePixelRatio ?? 1;
      return [window.screen.width, window.screen.height].map(v =>
        Math.floor(v * dpr)
      ) as Dimensions;
    },
    units: ['px'],
    defaultMargin: 10,
    allowRotate: true,
  },
  ...STANDARD_SIZES_CM.map(size => ({
    ...size,
    units: ['cm', 'inch'] as SizeUnit[],
    inUnits: 'cm' as SizeUnit,
    defaultMargin: 1,
    allowRotate: true,
  })),
  {
    id: 'custom',
    name: 'Custom size…',
    dimensions: ({ customDimensions, currentDimensions }) =>
      currentDimensions ?? customDimensions ?? DEFAULT_DIMENSIONS,
    allowSizeEdit: true,
    allowRotate: true,
  },
];

export function getDownloadImageSizeById(id: string): DownloadSizeType | null {
  return DOWNLOAD_IMAGE_SIZES.find(({ id: sizeId }) => sizeId === id);
}
