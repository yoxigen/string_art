import Nails from '../Nails.js';
import { ControlConfig } from '../types/config.types.js';
import { Coordinates, Dimensions } from '../types/general.types.js';
import { PI2 } from './math_utils.js';
import { compareObjects } from './object_utils.js';

export interface PolygonConfig {
  size: Dimensions;
  sides: number;
  fitSize?: boolean;
  nailsSpacing: number;
  margin?: number;
  rotation?: number;
  center?: Coordinates;
}

interface Side {
  cos: number;
  sin: number;
  center: {
    cos: number;
    sin: number;
  };
}

interface BoundingRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

interface TCalc {
  nailsPerSide: number;
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

export default class Polygon {
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
      margin,
      nailsSpacing,
    } = this.config;

    const sideAngle = PI2 / sideCount;

    const sides: ReadonlyArray<Side> = new Array(sideCount)
      .fill(null)
      .map((_, i) => {
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

    const center =
      configCenter ?? (this.config.size.map(v => v / 2) as Coordinates);

    const radius = Math.min(...size) / 2 - margin;
    const sideSize = 2 * radius * Math.sin(sideAngle / 2);
    const start: Coordinates = [
      radius * Math.sin(sideAngle / 2),
      radius * Math.cos(sideAngle / 2),
    ];
    const nailsDistance = sideSize * nailsSpacing;
    const radiusNailsCount = Math.floor(radius / nailsDistance);
    const radiusNailsDistance = radius / radiusNailsCount;

    return {
      nailsPerSide: 1 / nailsSpacing,
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

  get nailsPerSide(): number {
    return this.#calc.nailsPerSide;
  }

  get radiusNailsCount(): number {
    return this.#calc.radiusNailsCount;
  }

  getSidePoint({ side, index }): Coordinates {
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
    const radius = index * this.#calc.radiusNailsDistance;
    const { sin, cos } = this.#calc.sides[side].center;

    return [
      this.#calc.center[0] + sin * radius,
      this.#calc.center[1] + cos * radius,
    ];
  }

  getBoundingRect(): BoundingRect {
    const points = this.#calc.sides.map((_, side) =>
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

  drawNails(nails: Nails, { drawCenter = false, drawSides = true } = {}) {
    for (let side = 0; side < this.config.sides; side++) {
      const sideIndexStart = side * this.#calc.nailsPerSide;

      if (drawSides) {
        for (let index = 0; index < this.#calc.nailsPerSide; index++) {
          nails.addNail({
            point: this.getSidePoint({ side, index }),
            number: sideIndexStart + index,
          });
        }
      }

      if (drawCenter) {
        for (let index = 0; index < this.#calc.radiusNailsCount; index++) {
          nails.addNail({
            point: this.getCenterPoint({ side, index }),
            number: `${side}_${index}`,
          });
        }
      }
    }
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
      `${Math.round((rotation * 180) / sides)}°`,
    isStructural: true,
    affectsStepCount: false,
  };
}
