import NailsSetter from '../infra/nails/NailsSetter';
import { BoundingRect, Coordinates } from '../types/general.types';

export interface ShapeConfig {
  getUniqueKey?: (originalKey: number) => number;
}

export default abstract class Shape {
  protected getUniqueKey: ShapeConfig['getUniqueKey'];

  constructor(config: ShapeConfig) {
    this.getUniqueKey = config.getUniqueKey;
  }

  abstract getPoint(index: number): Coordinates;
  abstract getBoundingRect(): BoundingRect;
  getAspectRatio(): number {
    const rect = this.getBoundingRect();
    return rect.width / rect.height;
  }
  abstract drawNails(nails: NailsSetter): void;
}
