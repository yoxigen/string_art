import Nails from '../Nails';
import { BoundingRect, Coordinates } from '../types/general.types';

export abstract class Shape {
  abstract getPoint(index: number): Coordinates;
  abstract getBoundingRect(): BoundingRect;
  abstract getAspectRatio(): number;
  abstract drawNails(nails: Nails): void;
}
