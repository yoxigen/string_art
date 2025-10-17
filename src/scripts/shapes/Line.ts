import { ColorValue } from '../helpers/color/color.types';
import { PI2 } from '../helpers/math_utils';
import Nails from '../Nails';
import { BoundingRect, Coordinates } from '../types/general.types';
import { Shape } from './Shape';

type LinePosition = 'center' | 'from' | 'to';

export interface LineConfig {
  from: Coordinates;
  to: Coordinates;
  n: number;
  rotation?: number;
  rotationCenter?: Coordinates | LinePosition;
}

export class Line extends Shape {
  config: LineConfig;
  from: Coordinates;
  to: Coordinates;

  constructor(config: LineConfig) {
    super();
    if (config.n < 1) {
      throw new Error(`Can't create a Line with n less than 1.`);
    }

    this.config = config;

    const { rotation, from, to } = config;

    if (rotation) {
      const rotationAngle = -PI2 * rotation;
      const rotationCenter = this.#getRotationCenterCoordinates();

      this.from = this.#rotatePoint(from, rotationCenter, rotationAngle);
      this.to = this.#rotatePoint(to, rotationCenter, rotationAngle);
    } else {
      this.from = config.from;
      this.to = config.to;
    }
  }

  #getRotationCenterCoordinates(): Coordinates {
    const { from, to, rotationCenter } = this.config;
    if (!rotationCenter || rotationCenter === 'center') {
      return [from[0] + (to[0] - from[0]) / 2, from[1] + (to[1] - from[1]) / 2];
    } else {
      switch (rotationCenter) {
        case 'from':
          return from;
        case 'to':
          return to;
        default:
          return rotationCenter;
      }
    }
  }

  #rotatePoint(
    point: Coordinates,
    rotationCenter: Coordinates,
    rotationAngle: number
  ): Coordinates {
    const xDist = point[0] - rotationCenter[0];
    const yDist = point[1] - rotationCenter[1];

    const pointDistanceToCenter = Math.hypot(xDist, yDist);

    if (!pointDistanceToCenter) {
      return point;
    }

    const startingAngle =
      Math.asin(xDist / pointDistanceToCenter) + (yDist < 0 ? Math.PI : 0);

    return [
      rotationCenter[0] +
        Math.sin(startingAngle + rotationAngle) * pointDistanceToCenter,
      rotationCenter[1] +
        Math.cos(startingAngle + rotationAngle) * pointDistanceToCenter,
    ];
  }

  getPoint(index: number): Coordinates {
    const { n } = this.config;
    const { from, to } = this;

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
    const { from, to } = this;

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
