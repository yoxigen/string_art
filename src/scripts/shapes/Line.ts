import { ColorValue } from '../helpers/color/color.types';
import { PI2 } from '../helpers/math_utils';
import { mapDimensions } from '../helpers/size_utils';
import Nails from '../infra/nails/Nails';
import NailsGroup from '../infra/nails/NailsGroup';
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
  /**
   * distance between from and to, [x,y]
   */
  distance: [number, number];
  spaces: number;

  constructor(config: LineConfig) {
    super();
    if (config.n < 1) {
      throw new Error(`Can't create a Line with n less than 1.`);
    }

    this.config = config;

    const { rotation, from, to, n } = config;

    if (rotation) {
      const rotationAngle = -PI2 * rotation;
      const rotationCenter = this.#getRotationCenterCoordinates();

      this.from = this.#rotatePoint(from, rotationCenter, rotationAngle);
      this.to = this.#rotatePoint(to, rotationCenter, rotationAngle);
    } else {
      this.from = config.from;
      this.to = config.to;
    }

    this.distance = [this.to[0] - this.from[0], this.to[1] - this.from[1]];
    this.spaces = n - 1;
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
    const { from } = this;

    return mapDimensions(
      from,
      (v, i) => v + (this.distance[i] * index) / this.spaces
    );
  }

  drawNails(
    nails: Nails,
    {
      getNumber,
      color,
    }: { getNumber?: (n: number) => number | string; color?: ColorValue } = {}
  ): void {
    const nailsGroup = new NailsGroup({ color });
    for (let i = 0; i < this.config.n; i++) {
      nailsGroup.addNail(getNumber ? getNumber(i) : i + 1, this.getPoint(i));
    }

    nails.addGroup(nailsGroup);
  }

  getBoundingRect(): BoundingRect {
    const { from, to } = this;

    return {
      width: Math.abs(this.distance[0]),
      height: Math.abs(this.distance[1]),
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
