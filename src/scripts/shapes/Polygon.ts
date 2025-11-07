import { ControlConfig } from '../types/config.types';
import { BoundingRect, Coordinates, Dimensions } from '../types/general.types';
import { getDistanceBetweenCoordinates, PI2 } from '../helpers/math_utils';
import { compareObjects } from '../helpers/object_utils';
import {
  centerRect,
  fitInside,
  getBoundingRectAspectRatio,
  getBoundingRectForCoordinates,
  getCenter,
  mapDimensions,
} from '../helpers/size_utils';
import type Shape from './Shape';
import { formatFractionAsAngle } from '../helpers/string_utils';
import { createArray } from '../helpers/array_utils';
import INails from '../infra/nails/INails';
import { ShapeNailsOptions } from './Shape';
import { Line } from './Line';

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
    size: configSize,
    verticesCosSin,
  }: {
    center: Coordinates;
    size: Dimensions;
    verticesCosSin: [number, number][];
  }): { radius: number; center: Coordinates } {
    const radius = 1;

    const maxPointIndexes = [0, 0];
    const maxCoordinates = [...verticesCosSin[0]];

    for (let s = 1; s < this.config.sides; s++) {
      if (verticesCosSin[s][0] > maxCoordinates[0]) {
        maxPointIndexes[0] = s;
      }

      if (verticesCosSin[s][1] > maxCoordinates[1]) {
        maxPointIndexes[1] = s;
      }
    }
    const boundingRect = getBoundingRectForCoordinates(verticesCosSin);
    const scale = Math.min(
      configSize[0] / boundingRect.width,
      configSize[1] / boundingRect.height
    );
    const fittedRect = mapDimensions(
      [boundingRect.width, boundingRect.height],
      v => v * scale
    );
    const fittedRadius = radius * scale;
    const centerdFittedRect = centerRect(fittedRect, center);

    const newCenter = [
      centerdFittedRect.right -
        fittedRadius * verticesCosSin[maxPointIndexes[0]][0],
      centerdFittedRect.bottom -
        fittedRadius * verticesCosSin[maxPointIndexes[1]][1],
    ] as Coordinates;

    return {
      center: newCenter,
      radius: fittedRadius,
    };
  }

  #getPoints(): { center: Coordinates; vertices: Coordinates[] } {
    const {
      fitSize,
      rotation,
      size,
      sides,
      center: configCenter,
      margin,
      radius: radiusConfig,
    } = this.config;
    const rotationRadians = PI2 * rotation;
    const sizeWithoutMargin = mapDimensions(size, v => v - 2 * margin);
    let center = configCenter ?? getCenter(size);
    const angle = PI2 / sides;

    const verticesCosSin = createArray(this.config.sides, s => {
      const pointAngle = angle * (s + 0.5) + rotationRadians;

      return [Math.cos(pointAngle), Math.sin(pointAngle)];
    }) as Coordinates[];

    let radius: number = 0;

    if (fitSize) {
      const fitted = this.#fitSize({
        center,
        size: sizeWithoutMargin,
        verticesCosSin,
      });
      center = fitted.center;
      radius = fitted.radius;
    }

    const getRadius = (): number => {
      const smallestSide = Math.min(...sizeWithoutMargin);
      return sides % 2
        ? smallestSide / (Math.sin(Math.PI / this.config.sides) + 1)
        : smallestSide / 2;
    };

    radius = radiusConfig ?? getRadius();

    return {
      center,
      vertices: verticesCosSin.map(cosSin =>
        cosSin.map((v, i) => center[i] + v * radius)
      ) as Coordinates[],
    };
  }

  #getSideLines(vertices: Coordinates[]): Line[] {
    return createArray(
      this.config.sides,
      side =>
        new Line({
          from: vertices[side],
          to: vertices[(side + 1) % this.config.sides],
          n: this.config.nailsPerSide,
        })
    );
  }

  #getCenterLines(
    center: Coordinates,
    vertices: Coordinates[],
    n: number
  ): Line[] {
    return createArray(
      this.config.sides,
      side =>
        new Line({
          from: center,
          to: vertices[side],
          n,
        })
    );
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

    const { center, vertices } = this.#getPoints();

    const sideSize = getDistanceBetweenCoordinates(vertices[0], vertices[1]);
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
