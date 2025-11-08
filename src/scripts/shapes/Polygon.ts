import { ControlConfig } from '../types/config.types';
import { BoundingRect, Coordinates, Dimensions } from '../types/general.types';
import { getDistanceBetweenCoordinates, PI2 } from '../helpers/math_utils';
import { compareObjects } from '../helpers/object_utils';
import {
  centerRect,
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
  drawCenter?: boolean;
  drawSides?: boolean;
  drawCenterNail?: boolean;
}

interface TCalc {
  center: Coordinates;
  radius: number;
  sideSize: number;
  radiusNailsCount: number;
  vertices: ReadonlyArray<Coordinates>;
  sideLines: ReadonlyArray<Line>;
  centerLines: ReadonlyArray<Line>;
}

export default class Polygon implements Shape {
  config: PolygonConfig;
  #points: Map<string, Coordinates>;
  #calc: TCalc;

  constructor(config: PolygonConfig) {
    this.setConfig(config);
  }

  get center(): Coordinates {
    return this.#calc.center;
  }

  get radius(): number {
    return this.#calc.radius;
  }

  get sideSize(): number {
    return this.#calc.sideSize;
  }

  get radiusNailsCount(): number {
    return this.#calc.radiusNailsCount;
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
      centerdFittedRect.right - boundingRect.right * scale,
      centerdFittedRect.bottom - boundingRect.bottom * scale,
    ] as Coordinates;

    return {
      center: newCenter,
      radius: fittedRadius,
    };
  }

  #getPoints(): { center: Coordinates; vertices: Coordinates[]; radius } {
    const {
      fitSize,
      rotation,
      size,
      sides,
      center: configCenter,
      margin = 0,
      radius: radiusConfig,
    } = this.config;
    const rotationRadians = PI2 * rotation;
    const sizeWithoutMargin = mapDimensions(size, v => v - 2 * margin);
    let center = configCenter ?? getCenter(size);
    const angle = PI2 / sides;
    const startingAngle =
      sides % 2 ? -Math.PI / 2 : (sides / 2) % 2 ? 0 : Math.PI / sides;

    const verticesCosSin = createArray(sides, s => {
      const pointAngle = angle * s + startingAngle + rotationRadians;

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
    } else {
      const getRadius = (): number => {
        const smallestSide = Math.min(...sizeWithoutMargin);
        return smallestSide / 2;
      };

      radius = radiusConfig ?? getRadius();
    }

    return {
      center,
      vertices: verticesCosSin.map(cosSin =>
        cosSin.map((v, i) => center[i] + v * radius)
      ) as Coordinates[],
      radius,
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
      nailsPerSide,
      radiusNailsCountSameAsSides = false,
      drawCenter,
    } = this.config;

    const { center, vertices, radius } = this.#getPoints();

    const sideSize = getDistanceBetweenCoordinates(vertices[0], vertices[1]);

    const nailsDistance = sideSize / (nailsPerSide - 1);
    const radiusNailsCount = radiusNailsCountSameAsSides
      ? nailsPerSide
      : Math.max(2, Math.floor(radius / nailsDistance));

    return {
      center,
      radius,
      sideSize,
      radiusNailsCount,
      vertices,
      sideLines: this.#getSideLines(vertices),
      centerLines: drawCenter
        ? this.#getCenterLines(center, vertices, radiusNailsCount)
        : null,
    };
  }

  getPoint(index: number): Coordinates {
    const { nailsPerSide } = this.config;

    const position = index / nailsPerSide;
    const side = Math.floor(position);
    const sideIndex = index % nailsPerSide;

    return this.getSidePoint({ side, index: sideIndex });
  }

  getSidePoint({ side, index }: { side: number; index: number }): Coordinates {
    return this.#calc.sideLines[side].getPoint(index);
  }

  getCenterPoint({ side, index }): Coordinates {
    if (index < 0) {
      throw new Error(`Can't get polygon center point for index = (${index}).`);
    }

    if (side < 0) {
      throw new Error(`Can't get polygon center point for side = (${index}).`);
    }
    return this.#calc.centerLines[side].getPoint(index);
  }

  getBoundingRect(): BoundingRect {
    return getBoundingRectForCoordinates(this.#calc.vertices);
  }

  getAspectRatio(): number {
    return getBoundingRectAspectRatio(this.getBoundingRect());
  }

  drawNails(nails: INails, { getUniqueKey }: ShapeNailsOptions = {}) {
    const { sideLines, centerLines, radiusNailsCount, center } = this.#calc;
    const {
      sides,
      nailsPerSide: nailsPerSideConfig,
      drawCenter = false,
      drawCenterNail = false,
      drawSides = true,
    } = this.config;

    let startIndex = 0;
    const lineGetUniqueKey = getUniqueKey
      ? (k: number) => getUniqueKey(k)
      : (k: number) => k;

    if (drawCenterNail) {
      nails.addNail(lineGetUniqueKey(0), center);
      startIndex = 1;
    }

    if (drawCenter) {
      let nailsPerRadius = radiusNailsCount - 1;

      if (drawSides) {
        nailsPerRadius--;
      }

      for (let side = 0; side < sides; side++) {
        centerLines[side].drawNails(nails, {
          getUniqueKey: k => lineGetUniqueKey(startIndex + k),
          startIndex: 1,
          endIndex: drawSides ? radiusNailsCount - 1 : radiusNailsCount,
        });
        startIndex += nailsPerRadius;
      }
    }

    if (drawSides) {
      const nailsPerSide = nailsPerSideConfig - 1;
      for (let side = 0; side < sides; side++) {
        sideLines[side].drawNails(nails, {
          getUniqueKey: k => lineGetUniqueKey(startIndex + k),
          endIndex: this.config.nailsPerSide - 1,
        });
        startIndex += nailsPerSide;
      }
    }
  }

  getNailsCount(): number {
    const {
      drawCenter = false,
      drawCenterNail = true,
      drawSides = true,
    } = this.config;
    const nailsPerSide =
      (drawSides ? this.config.nailsPerSide - 1 : 0) +
      (drawCenter ? this.#calc.radiusNailsCount - 2 : 0);

    return (
      this.config.sides * nailsPerSide + (drawCenter && drawCenterNail ? 1 : 0)
    );
  }

  /**
   * Returns the shortest distance between the polygon's center and any of the side lines
   */
  getApothem(): number {
    return this.radius * Math.cos(Math.PI / this.config.sides);
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
