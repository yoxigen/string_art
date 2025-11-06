import { ControlConfig } from '../types/config.types';
import { BoundingRect, Coordinates, Dimensions } from '../types/general.types';
import { PI2 } from '../helpers/math_utils';
import { compareObjects } from '../helpers/object_utils';
import {
  fitInside,
  getBoundingRectAspectRatio,
  getBoundingRectForCoordinates,
  getCenter,
} from '../helpers/size_utils';
import type Shape from './Shape';
import { formatFractionAsAngle } from '../helpers/string_utils';
import { createArray } from '../helpers/array_utils';
import INails from '../infra/nails/INails';
import { ShapeNailsOptions } from './Shape';

export interface PolygonConfig {
  size: Dimensions;
  sides: number;
  fitSize?: boolean;
  nailsPerSide: number;
  margin?: number;
  rotation?: number;
  center?: Coordinates;
  radiusNailsCountSameAsSides?: boolean;
  radius?: number;
}

interface Side {
  cos: number;
  sin: number;
  center: {
    cos: number;
    sin: number;
  };
}

type PolygonNailsOptions = ShapeNailsOptions & {
  drawCenter?: boolean;
  drawSides?: boolean;
  drawCenterNail?: boolean;
};

interface TCalc {
  center: Coordinates;
  radius: number;
  sideSize: number;
  start: Coordinates;
  nailsDistance: number;
  radiusNailsCount: number;
  radiusNailsDistance: number;
  sides: ReadonlyArray<Side>;
  sideAngle: number;
}

export default class Polygon implements Shape {
  config: PolygonConfig;
  #points: Map<string, Coordinates>;
  #calc: TCalc;

  constructor(config: PolygonConfig) {
    this.setConfig(config);
  }

  setConfig(config: PolygonConfig) {
    if (!compareObjects(config, this.config)) {
      this.config = config;

      if (this.#points) {
        this.#points.clear();
      } else {
        this.#points = new Map();
      }

      this.#calc = this.#getCalc();
    }
  }

  #fitSize({
    center,
    radius,
    rotation = 0,
    size: configSize,
  }: {
    center: Coordinates;
    radius: number;
    rotation?: number;
    size: Dimensions;
  }): { scale: number; center: Coordinates } {
    const angle = PI2 / this.config.sides;
    const points = createArray(this.config.sides, s => [
      center[0] + radius * Math.cos(s * angle + rotation - angle / 2),
      center[1] + radius * Math.sin(s * angle + rotation - angle / 2),
    ]) as Coordinates[];
    const boundingRect = getBoundingRectForCoordinates(points);
    const scale = Math.min(
      configSize[0] / boundingRect.width,
      configSize[1] / boundingRect.height
    );

    const newCenter = [
      center[0] -
        (scale * (boundingRect.left - configSize[0] + boundingRect.right)) / 2,
      center[1] -
        (scale * (boundingRect.top - configSize[1] + boundingRect.bottom)) / 2,
    ] as Coordinates;

    return { center: newCenter, scale };
  }

  #getCalc(): TCalc {
    const {
      size: configSize,
      rotation = 0,
      sides: sideCount,
      center: configCenter,
      margin = 0,
      nailsPerSide,
      radiusNailsCountSameAsSides = false,
      radius: radiusConfig,
      fitSize,
    } = this.config;

    const sideAngle = PI2 / sideCount;
    const rotationRadians = PI2 * rotation;
    const sides: ReadonlyArray<Side> = createArray(sideCount, i => {
      const angle = sideAngle * i + rotationRadians;
      const radiusAngle = -sideAngle * (i - 0.5) - rotationRadians;

      return {
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        center: {
          cos: Math.cos(radiusAngle),
          sin: Math.sin(radiusAngle),
        },
      };
    });

    const getRadius = (): number => {
      const smallestSide = Math.min(...configSize) - 2 * margin;
      return this.config.sides % 2
        ? smallestSide / (Math.sin(Math.PI / this.config.sides) + 1)
        : smallestSide / 2;
    };
    let radius = radiusConfig ?? getRadius();
    let center = configCenter ?? getCenter(configSize);

    if (fitSize) {
      const { scale, center: fittedCenter } = this.#fitSize({
        center: configCenter ?? getCenter(configSize),
        radius,
        size: configSize,
      });
      radius *= scale;
      center = fittedCenter;
    }

    const sideSize = 2 * radius * Math.sin(sideAngle / 2);
    const start: Coordinates = [
      radius * Math.sin(sideAngle / 2),
      radius * Math.cos(sideAngle / 2),
    ];
    const nailsDistance = sideSize / (nailsPerSide - 1);
    const radiusNailsCount = radiusNailsCountSameAsSides
      ? nailsPerSide
      : Math.max(2, Math.floor(radius / nailsDistance));
    const radiusNailsDistance = radius / (radiusNailsCount - 1);

    return {
      center,
      radius,
      sideSize,
      start,
      nailsDistance,
      radiusNailsCount,
      radiusNailsDistance,
      sides,
      sideAngle,
    };
  }

  get radiusNailsCount(): number {
    return this.#calc.radiusNailsCount;
  }

  get sideSize(): number {
    return this.#calc.sideSize;
  }

  getPoint(index: number): Coordinates {
    const { nailsPerSide } = this.config;

    const position = index / nailsPerSide;
    const side = Math.floor(position);
    const sideIndex = index % nailsPerSide;

    return this.getSidePoint({ side, index: sideIndex });
  }

  getSidePoint(
    { side, index }: { side: number; index: number },
    cache = true
  ): Coordinates {
    const pointsMapIndex = [side, index].join('_');

    if (cache && this.#points.has(pointsMapIndex)) {
      return this.#points.get(pointsMapIndex);
    }

    const startX = this.#calc.start[0] - index * this.#calc.nailsDistance;
    const { cos, sin } = this.#calc.sides[side];

    const point = [
      cos * startX - sin * this.#calc.start[1] + this.#calc.center[0],
      sin * startX + cos * this.#calc.start[1] + this.#calc.center[1],
    ] as Coordinates;

    if (cache) {
      this.#points.set(pointsMapIndex, point);
    }
    return point;
  }

  getCenterPoint({ side, index }): Coordinates {
    if (index < 0) {
      throw new Error(`Can't get polygon center point for index = (${index}).`);
    }

    if (side < 0) {
      throw new Error(`Can't get polygon center point for side = (${index}).`);
    }
    const radius = index * this.#calc.radiusNailsDistance;
    const { sin, cos } = this.#calc.sides[side].center;

    return [
      this.#calc.center[0] + sin * radius,
      this.#calc.center[1] + cos * radius,
    ];
  }

  getBoundingRect(): BoundingRect {
    const points = createArray(this.config.sides, side =>
      this.getSidePoint({ side, index: 0 }, false)
    );
    return getBoundingRectForCoordinates(points);
  }

  getAspectRatio(): number {
    return getBoundingRectAspectRatio(this.getBoundingRect());
  }

  drawNails(
    nails: INails,
    {
      drawCenter = false,
      drawSides = true,
      drawCenterNail = true,
      getUniqueKey,
    }: PolygonNailsOptions = {}
  ) {
    const { nailsPerSide } = this.config;

    let nailIndex = 0;
    if (drawCenter && drawCenterNail) {
      nails.addNail(nailIndex, this.getCenterPoint({ side: 0, index: 0 }));
      nailIndex++;
    }

    for (let side = 0; side < this.config.sides; side++) {
      if (drawSides) {
        for (let index = 0; index < nailsPerSide - 1; index++) {
          nails.addNail(
            getUniqueKey?.(nailIndex) ?? nailIndex,
            this.getSidePoint({ side, index })
          );
          nailIndex++;
        }
      }

      if (drawCenter) {
        for (let index = 1; index < this.#calc.radiusNailsCount - 1; index++) {
          nails.addNail(
            getUniqueKey?.(nailIndex) ?? nailIndex,
            this.getCenterPoint({ side, index })
          );
          nailIndex++;
        }
      }
    }
  }

  getNailsCount({
    drawCenter = false,
    drawSides = true,
    drawCenterNail = true,
  }: PolygonNailsOptions = {}): number {
    const nailsPerSide =
      (drawSides ? this.config.nailsPerSide - 1 : 0) +
      (drawCenter ? this.#calc.radiusNailsCount - 2 : 0);

    return (
      this.config.sides * nailsPerSide + (drawCenter && drawCenterNail ? 1 : 0)
    );
  }

  static rotationConfig: ControlConfig<{ rotation: number; sides: number }> = {
    key: 'rotation',
    label: 'Rotation',
    defaultValue: 0,
    type: 'range',
    attr: {
      min: 0,
      max: 1,
      step: 0.02,
    },
    displayValue: ({ rotation, sides }) =>
      formatFractionAsAngle(rotation / (2 * sides)),
    isStructural: true,
    affectsStepCount: false,
  };
}
