import { ControlConfig } from '../types/config.types';
import { BoundingRect, Coordinates, Dimensions } from '../types/general.types';
import { getDistanceBetweenCoordinates, PI2 } from '../helpers/math_utils';
import {
  centerRect,
  getBoundingRectAspectRatio,
  getBoundingRectForCoordinates,
  getCenter,
  mapDimensions,
} from '../helpers/size_utils';
import Shape from './Shape';
import { formatFractionAsAngle } from '../helpers/string_utils';
import { createArray } from '../helpers/array_utils';
import NailsSetter from '../infra/nails/NailsSetter';
import { ShapeConfig } from './Shape';
import { Line } from './Line';

type PolygonSizeConfig = {
  size: Dimensions;
  fitSize?: boolean;
};

type PolygonWithRadiusConfig = {
  radius: number;
};

type PolygonSizeOrRadiusConfig =
  | (PolygonSizeConfig & { radius?: never })
  | (PolygonWithRadiusConfig & { size?: never; fitSize?: boolean });

export type PolygonConfig = ShapeConfig &
  PolygonSizeOrRadiusConfig & {
    sides: number;
    nailsPerSide: number;
    rotation?: number;
    center?: Coordinates;
    radiusNailsCountSameAsSides?: boolean;
    drawCenter?: boolean;
    drawSides?: boolean;
    drawCenterNail?: boolean;
    margin?: number;
  };

interface TCalc {
  center: Coordinates;
  radius: number;
  sideSize: number;
  radiusNailsCount: number;
  vertices: ReadonlyArray<Coordinates>;
  sideLines: ReadonlyArray<Line>;
  centerLines: ReadonlyArray<Line>;
}

export default class Polygon extends Shape {
  #calc: TCalc;

  constructor(public config: PolygonConfig) {
    super(config);

    this.#calc = this.#getCalc();
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

  #getPoints(): {
    center: Coordinates;
    vertices: Coordinates[];
    radius: number;
  } {
    const {
      fitSize,
      rotation = 0,
      size,
      sides,
      center: configCenter,
      margin = 0,
      radius: radiusConfig,
    } = this.config;
    const rotationRadians = PI2 * rotation;
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
        size: mapDimensions(size, v => v - 2 * margin),
        verticesCosSin,
      });
      center = fitted.center;
      radius = fitted.radius;
    } else {
      const getRadius = (): number => {
        const smallestSide = Math.min(
          ...mapDimensions(size, v => v - 2 * margin)
        );
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

  #getSideLines(vertices: Coordinates[], startIndex: number): Line[] {
    return createArray(this.config.sides, side => {
      const lineStartIndex = startIndex + side * (this.config.nailsPerSide - 1);

      return new Line({
        from: vertices[side],
        to: vertices[(side + 1) % this.config.sides],
        n: this.config.nailsPerSide,
        drawEndIndex: this.config.nailsPerSide - 1,
        getUniqueKey: this.getUniqueKey
          ? k => this.getUniqueKey(lineStartIndex + k)
          : k => lineStartIndex + k,
      });
    });
  }

  #getCenterLines(
    center: Coordinates,
    vertices: Coordinates[],
    n: number,
    nailIndexesPerCenterLine: number
  ): Line[] {
    const { drawSides = true, drawCenterNail } = this.config;

    const startIndex = drawCenterNail ? 1 : 0;

    return createArray(this.config.sides, side => {
      const lineStartIndex = startIndex + side * nailIndexesPerCenterLine;

      return new Line({
        from: center,
        to: vertices[side],
        n,
        drawStartIndex: 1,
        drawEndIndex: drawSides ? n - 1 : n,
        getUniqueKey: this.getUniqueKey
          ? k => this.getUniqueKey(lineStartIndex + k)
          : k => lineStartIndex + k,
      });
    });
  }

  #getCalc(): TCalc {
    const {
      nailsPerSide,
      radiusNailsCountSameAsSides = false,
      drawCenter,
      drawCenterNail,
      sides,
      drawSides = true,
    } = this.config;

    const { center, vertices, radius } = this.#getPoints();

    const sideSize = getDistanceBetweenCoordinates(vertices[0], vertices[1]);

    const nailsDistance = sideSize / (nailsPerSide - 1);
    const radiusNailsCount = radiusNailsCountSameAsSides
      ? nailsPerSide
      : Math.max(2, Math.floor(radius / nailsDistance));

    const nailIndexesPerCenterLine = radiusNailsCount - 1 - (drawSides ? 1 : 0);

    return {
      center,
      radius,
      sideSize,
      radiusNailsCount,
      vertices,
      sideLines: this.#getSideLines(
        vertices,
        (drawCenterNail ? 1 : 0) +
          (drawCenter ? nailIndexesPerCenterLine * sides : 0)
      ),
      centerLines: drawCenter
        ? this.#getCenterLines(
            center,
            vertices,
            radiusNailsCount,
            nailIndexesPerCenterLine
          )
        : null,
    };
  }

  #getPositionForIndex(index: number): { side: number; index: number } {
    const { nailsPerSide } = this.config;

    const position = index / nailsPerSide;
    const side = Math.floor(position);
    const sideIndex = index % nailsPerSide;

    return { side, index: sideIndex };
  }

  getPoint(index: number): Coordinates {
    return this.getSidePoint(this.#getPositionForIndex(index));
  }

  getSideNailIndex(index: number): number;
  getSideNailIndex(side: number, index: number): number;

  getSideNailIndex(side: number, index?: number): number {
    if (index == undefined) {
      // overload where the index is for the whole polygon
      const position = this.#getPositionForIndex(side);
      return this.#calc.sideLines[position.side].getNailIndex(position.index);
    }

    return this.#calc.sideLines[side].getNailIndex(index);
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

  getCenterNailIndex(side: number, index: number): number {
    if (index === 0) {
      return this.getUniqueKey?.(0) ?? 0;
    }

    return this.#calc.centerLines[side].getNailIndex(index);
  }

  getBoundingRect(): BoundingRect {
    return getBoundingRectForCoordinates(this.#calc.vertices);
  }

  getAspectRatio(): number {
    return getBoundingRectAspectRatio(this.getBoundingRect());
  }

  drawNails(nails: NailsSetter) {
    const { sideLines, centerLines, center } = this.#calc;
    const {
      sides,
      drawCenter = false,
      drawCenterNail = false,
      drawSides = true,
    } = this.config;

    if (drawCenterNail) {
      nails.addNail(this.getUniqueKey?.(0) ?? 0, center);
    }

    if (drawCenter) {
      for (let side = 0; side < sides; side++) {
        centerLines[side].drawNails(nails);
      }
    }

    if (drawSides) {
      for (let side = 0; side < sides; side++) {
        sideLines[side].drawNails(nails);
      }
    }
  }

  getNailsCount(): number {
    const {
      drawCenter = false,
      drawCenterNail,
      drawSides = true,
    } = this.config;
    const nailsPerSide =
      (drawSides ? this.config.nailsPerSide - 1 : 0) +
      (drawCenter ? this.#calc.radiusNailsCount - 1 - (drawSides ? 1 : 0) : 0);

    return (
      this.config.sides * nailsPerSide +
      (drawCenterNail || (drawCenter && drawCenterNail !== false) ? 1 : 0)
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
      step: 0.0025,
    },
    displayValue: ({ rotation, sides }) =>
      formatFractionAsAngle(rotation / (2 * sides), 1),
    isStructural: true,
    affectsStepCount: false,
  };
}
