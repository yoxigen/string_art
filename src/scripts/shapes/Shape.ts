import Nails from '../infra/nails/Nails';
import { BoundingRect, Coordinates } from '../types/general.types';

export interface ShapeNailsOptions {
  nailsNumberStart?: number;
  getNumber?: (n: number | string) => string;
}

export abstract class Shape {
  abstract getPoint(index: number): Coordinates;
  abstract getBoundingRect(): BoundingRect;
  abstract getAspectRatio(): number;
  abstract drawNails(nails: Nails, options?: ShapeNailsOptions): void;
}
