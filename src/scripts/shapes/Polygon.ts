import Nails from '../infra/nails/Nails';
import { ControlConfig } from '../types/config.types';
import { BoundingRect, Coordinates, Dimensions } from '../types/general.types';
import { PI2 } from '../helpers/math_utils';
import { compareObjects } from '../helpers/object_utils';
import { getBoundingRectAspectRatio, getCenter } from '../helpers/size_utils';
import { Shape, ShapeNailsOptions } from './Shape';
import { formatFractionAsAngle } from '../helpers/string_utils';
import { createArray } from '../helpers/array_utils';
import NailsGroup from '../infra/nails/NailsGroup';
import { NailsRenderOptions } from '../types/stringart.types';

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

type PolygonNailsOptions = Partial<NailsRenderOptions> & {
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

export default class Polygon extends Shape {
  config: PolygonConfig;
  #points: Map<string, Coordinates>;
  #calc: TCalc;

  constructor(config: PolygonConfig) {
    super();
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

      if (config.fitSize) {
        const sizeAndCenter = this.#getSizeAndCenter();
        this.#points.clear();
        this.#calc = { ...this.#getCalc(), ...sizeAndCenter };
      }
    }
  }

  #getSizeAndCenter(): {
    size: Dimensions;
    center: Coordinates;
  } {
    const { size: configSize, margin } = this.config;

    const boundingRect = this.getBoundingRect();
    const scale = Math.min(
      (configSize[0] - 2 * margin) / boundingRect.width,
      (configSize[1] - 2 * margin) / boundingRect.height
    );

    const size = configSize.map(v => v * scale) as Dimensions;
    const center = [
      this.#calc.center[0] -
        (scale * (boundingRect.left - configSize[0] + boundingRect.right)) / 2,
      this.#calc.center[1] -
        (scale * (boundingRect.top - configSize[1] + boundingRect.bottom)) / 2,
    ] as Coordinates;

    return { size, center };
  }

  #getCalc(): TCalc {
    const {
      size,
      rotation = 0,
      sides: sideCount,
      center: configCenter,
      margin = 0,
      nailsPerSide,
      radiusNailsCountSameAsSides = false,
      radius: radiusConfig,
    } = this.config;

    const sideAngle = PI2 / sideCount;

    const sides: ReadonlyArray<Side> = createArray(sideCount, i => {
      const angle = sideAngle * i + PI2 * rotation;
      const radiusAngle = -sideAngle * (i - 0.5) - PI2 * rotation;

      return {
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        center: {
          cos: Math.cos(radiusAngle),
          sin: Math.sin(radiusAngle),
        },
      };
    });

    const center = configCenter ?? getCenter(size);

    const radius = radiusConfig ?? Math.min(...size) / 2 - margin;
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

  getSidePoint({ side, index }: { side: number; index: number }): Coordinates {
    const pointsMapIndex = [side, index].join('_');

    if (this.#points.has(pointsMapIndex)) {
      return this.#points.get(pointsMapIndex);
    }

    const startX = this.#calc.start[0] - index * this.#calc.nailsDistance;
    const { cos, sin } = this.#calc.sides[side];

    const point = [
      cos * startX - sin * this.#calc.start[1] + this.#calc.center[0],
      sin * startX + cos * this.#calc.start[1] + this.#calc.center[1],
    ] as Coordinates;

    this.#points.set(pointsMapIndex, point);
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
      this.getSidePoint({ side, index: 0 })
    );
    const firstPoint = points[0];

    const boundingRect = points.slice(1).reduce(
      (boundingRect, [x, y]) => ({
        left: Math.min(boundingRect.left, x),
        right: Math.max(boundingRect.right, x),
        top: Math.min(boundingRect.top, y),
        bottom: Math.max(boundingRect.bottom, y),
      }),
      {
        left: firstPoint[0],
        right: firstPoint[0],
        top: firstPoint[1],
        bottom: firstPoint[1],
      }
    );

    return {
      ...boundingRect,
      height: boundingRect.bottom - boundingRect.top,
      width: boundingRect.right - boundingRect.left,
    };
  }

  getAspectRatio(): number {
    return getBoundingRectAspectRatio(this.getBoundingRect());
  }

  drawNails(
    nails: Nails,
    {
      nailsNumberStart = 0,
      getNumber,
      ...nailsOptions
    }: PolygonNailsOptions & ShapeNailsOptions = {}
  ) {
    const { nailsPerSide } = this.config;
    const {
      drawCenter = false,
      drawSides = true,
      drawCenterNail = true,
    } = nailsOptions;

    const nailsGroup = new NailsGroup(nailsOptions);
    let nailIndex = 0;
    if (drawCenter && drawCenterNail) {
      nailsGroup.addNail('C', this.getCenterPoint({ side: 0, index: 0 }));
      nailIndex++;
    }

    for (let side = 0; side < this.config.sides; side++) {
      const sideIndexStart = nailsNumberStart + side * nailsPerSide;

      if (drawSides) {
        for (let index = 0; index < nailsPerSide - 1; index++) {
          const number = sideIndexStart + index;
          nailsGroup.addNail(
            getNumber ? getNumber(number) : number,
            this.getSidePoint({ side, index })
          );
          nailIndex++;
        }
      }

      if (drawCenter) {
        for (let index = 1; index < this.#calc.radiusNailsCount - 1; index++) {
          const number = `${side}_${index}`;
          nailsGroup.addNail(
            getNumber ? getNumber(number) : number,
            this.getCenterPoint({ side, index })
          );
          nailIndex++;
        }
      }
    }

    nails.addGroup(nailsGroup);
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
