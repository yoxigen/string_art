import { ColorValue } from '../helpers/color/color.types';

export interface ThreadColorLength {
  color: ColorValue;
  length: number;
}

export type ThreadsLength = {
  total: number;
  perColor: ReadonlyArray<ThreadColorLength>;
};

export interface PatternInfo {
  nailsCount: number;
  threadsLength: ThreadsLength;
  closestDistanceBetweenNails: number;
}
