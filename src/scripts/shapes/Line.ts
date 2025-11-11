import { PI2 } from '../helpers/math_utils';
import { mapDimensions } from '../helpers/size_utils';
import NailsSetter from '../infra/nails/NailsSetter';
import { BoundingRect, Coordinates } from '../types/general.types';
import Shape from './Shape';
import { ShapeConfig } from './Shape';

type LinePosition = 'center' | 'from' | 'to';

export type LineConfig = ShapeConfig & {
  from: Coordinates;
  to: Coordinates;
  n: number;
  rotation?: number;
  rotationCenter?: Coordinates | LinePosition;
  drawStartIndex?: number;
  drawEndIndex?: number;
};

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
    super(config);

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

  getNailIndex(index: number): number {
    const realIndex = index - (this.config.drawStartIndex ?? 0);
    return this.getUniqueKey?.(realIndex) ?? realIndex;
  }

  drawNails(nails: NailsSetter): void {
    const { drawStartIndex: startIndex = 0, drawEndIndex: endIndex } =
      this.config;

    const lastIndex = endIndex ?? this.config.n;
    for (let i = startIndex; i < lastIndex; i++) {
      const index = i - startIndex;
      nails.addNail(this.getUniqueKey?.(index) ?? index, this.getPoint(i));
    }
  }

  getNailCount(): number {
    const lastIndexCount = this.config.drawEndIndex
      ? this.config.drawEndIndex + 1
      : this.config.n;
    return lastIndexCount - (this.config.drawStartIndex ?? 0);
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
