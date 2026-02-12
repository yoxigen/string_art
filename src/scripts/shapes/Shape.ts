import Nails from '../infra/nails/Nails';
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
  abstract addNails(nails: NailsSetter): void;

  abstract getNailCount(): number;

  getNails(precision?: number): Nails {
    const nails = new Nails(precision);
    this.addNails(nails);
    return nails;
  }
}
