import { ColorValue } from '../helpers/color/color.types';
import Nails from '../Nails';
import { BoundingRect, Coordinates } from '../types/general.types';
import { Shape } from './Shape';

export interface LineConfig {
  from: Coordinates;
  to: Coordinates;
  n: number;
}

export class Line extends Shape {
  config: LineConfig;

  constructor(config: LineConfig) {
    super();
    this.config = config;
  }

  getPoint(index: number): Coordinates {
    const { from, to, n } = this.config;

    return [
      from[0] + ((to[0] - from[0]) * (n - index - 1)) / (n - 1),
      from[1] + ((to[1] - from[1]) * (n - index - 1)) / (n - 1),
    ];
  }

  drawNails(
    nails: Nails,
    {
      getNumber,
      color,
    }: { getNumber?: (n: number) => number | string; color?: ColorValue } = {}
  ): void {
    const nailsArr = [];

    for (let i = 0; i < this.config.n; i++) {
      nailsArr.push({
        point: this.getPoint(i),
        number: getNumber ? getNumber(i) : i + 1,
      });
    }

    nails.addGroup(nailsArr, { color });
  }

  getBoundingRect(): BoundingRect {
    const { from, to } = this.config;

    return {
      width: Math.abs(to[0] - from[0]),
      height: Math.abs(to[1] - from[1]),
      top: Math.min(to[1], from[1]),
      bottom: Math.max(to[1], from[1]),
      left: Math.min(from[0], to[0]),
      right: Math.max(from[0], to[0]),
    };
  }

  getAspectRatio(): number {
    const { width, height } = this.getBoundingRect();
    return width / height;
  }
}
