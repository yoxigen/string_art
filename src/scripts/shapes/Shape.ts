import INails from '../infra/nails/INails';
import { BoundingRect, Coordinates } from '../types/general.types';

export type ShapeNailsOptions = {
  getUniqueKey?: (originalKey: number) => number;
};

export default interface Shape {
  getPoint(index: number): Coordinates;
  getBoundingRect(): BoundingRect;
  getAspectRatio(): number;
  drawNails(nails: INails, options?: ShapeNailsOptions): void;
}
