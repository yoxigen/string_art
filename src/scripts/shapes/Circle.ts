import Renderer from '../infra/renderers/Renderer';
import { ControlConfig, GroupValue } from '../types/config.types';
import { BoundingRect, Coordinates, Dimensions } from '../types/general.types';
import { ColorValue } from '../helpers/color/color.types';
import easing from '../helpers/easing';
import { distortionToAspectRatio, PI2 } from '../helpers/math_utils';
import { compareObjects } from '../helpers/object_utils';
import Polygon from './Polygon';
import { fitInside, getCenter } from '../helpers/size_utils';
import Shape from './Shape';
import { formatFractionAsAngle } from '../helpers/string_utils';
import NailsSetter from '../infra/nails/NailsSetter';
import { ShapeConfig } from './Shape';

export type CircleConfig = ShapeConfig & {
  n: number;
  size: Dimensions;
  margin?: number;
  rotation?: number;
  center?: Coordinates;
  radius?: number;
  reverse?: boolean;
  distortion?: number;
  displacement?: GroupValue;
  displacementFunc?: keyof typeof easing;
  displacementMag?: number;
  displacementFastArea?: number;
  /**
   * The angle at which to start rendering the circle (in radians)
   */
  angleStart?: number;
  /**
   * The angle at which to end rendering the circle (in radians)
   */
  angleEnd?: number;
};

export type CircleNailsOptions = {
  /**
   * Filters the nails that are added. Return false to not draw the nail with the specified index
   */
  filter?: (nailIndex: number) => boolean;
};

export default class Circle extends Shape {
  easingFunction: Function;
  config: CircleConfig;
  center: Coordinates;
  xyRadius: Dimensions;
  rotationAngle: number = 0;
  indexAngle: number;
  isReverse: boolean = false;
  radius: number;
  arc: number = PI2;
  isPartialArc: boolean = false;
  excludedNailIndexes: ReadonlySet<number>;

  constructor(config: CircleConfig) {
    super(config);
    this.setConfig(config);
  }

  getPoint(index: number): Coordinates {
    const realIndex = this.#getNailIndex(index);

    const angle =
      this.easingFunction(
        realIndex / (this.config.n - (this.isPartialArc ? 1 : 0))
      ) *
        this.arc +
      this.rotationAngle +
      (this.config.angleStart ?? 0);

    const point: Coordinates = [
      this.center[0] + Math.sin(angle) * this.xyRadius[0],
      this.center[1] + Math.cos(angle) * this.xyRadius[1],
    ];

    return point;
  }

  #getNailIndex(index = 0): number {
    const withReverse = this.isReverse ? this.config.n - 1 - index : index;
    return (
      (withReverse < 0 ? this.config.n + withReverse : withReverse) %
      this.config.n
    );
  }

  getNailKey(index: number): number {
    const realIndex = this.#getNailIndex(index);
    return this.getUniqueKey?.(realIndex) ?? realIndex;
  }

  getAspectRatio(): number {
    if (!this.config.distortion) {
      return 1;
    }

    const aspectRatio = distortionToAspectRatio(this.config.distortion);
    return aspectRatio[0] / aspectRatio[1];
  }

  /**
   * The bounding rect of the Circle is not just [diameter, diameter], because a 3 nail circle is a triangle, for example,
   * in which case the bounding rect won't take that fill rect. Using a Polygon instead, which is more precise.
   */
  getBoundingRect(): BoundingRect {
    const { n, rotation } = this.config;

    if (n < 16) {
      const polygon = new Polygon({
        sides: n,
        rotation,
        size: [this.radius * 2, this.radius * 2],
        nailsPerSide: 1,
        center: this.center,
      });

      return polygon.getBoundingRect();
    }

    return {
      top: this.center[1] - this.xyRadius[1],
      left: this.center[0] - this.xyRadius[0],
      right: this.center[0] + this.xyRadius[0],
      bottom: this.center[1] + this.xyRadius[1],
      width: this.xyRadius[0] * 2,
      height: this.xyRadius[1] * 2,
    };
  }

  setConfig(config: CircleConfig): void {
    if (!compareObjects(config, this.config)) {
      const {
        n,
        size,
        margin = 0,
        rotation = 0,
        center: configCenter,
        radius,
        reverse = false,
        angleStart,
        angleEnd,
      } = config;
      const center = configCenter ?? getCenter(size);
      const clampedRadius = Math.max(
        1,
        (radius ?? Math.min(...getCenter(size))) - margin
      );

      let xyRadius = [clampedRadius, clampedRadius];

      if (config.distortion) {
        const aspectRatio = distortionToAspectRatio(config.distortion);
        const distortedBox = aspectRatio.map(
          v => clampedRadius * v
        ) as Dimensions;
        xyRadius = fitInside(
          distortedBox,
          size.map(v => Math.max(0, v / 2 - margin)) as Dimensions
        );
      }

      // Normally, the whole circle is rendered, but if angleStart and angleEnd are configured and valid, and arc between them is rendered:
      this.isPartialArc = angleStart && angleEnd && angleEnd > angleStart;
      const arc = this.isPartialArc ? angleEnd - angleStart : PI2;

      const props = {
        center,
        radius: clampedRadius,
        xyRadius,
        indexAngle: arc / (this.isPartialArc ? n - 1 : n),
        rotationAngle: -PI2 * rotation,
        isReverse: reverse,
        arc,
      };

      const easingFunction = config.displacementFunc
        ? easing[config.displacementFunc]
        : easing.linear;
      const easingParams = [];
      // @ts-ignore
      if (easingFunction.requirePower) {
        easingParams.push(config.displacementMag);
      }
      // @ts-ignore
      if (easingFunction.requireFastArea) {
        easingParams.push(config.displacementFastArea);
      }
      const easingFunctionWithParams = easingParams.length
        ? easingFunction.bind(null, ...easingParams)
        : easingFunction;

      this.easingFunction = easingFunctionWithParams;
      this.config = config;
      Object.assign(this, props);
    }
  }

  /**
   * Given a Nails instance, uses it to draw the nails of this Circle
   * @param {Nails} nails
   * @param {{nailsNumberStart?: number, getNumber?: Function}} param1
   */
  drawNails(nails: NailsSetter, { filter }: CircleNailsOptions = {}): void {
    for (let i = 0; i < this.config.n; i++) {
      if (!filter || filter(i)) {
        nails.addNail(this.getUniqueKey?.(i) ?? i, this.getPoint(i));
      }
    }
  }

  *drawRing(
    renderer: Renderer,
    { ringSize, color }: { ringSize: number; color?: ColorValue }
  ): Generator<void> {
    const { n } = this.config;
    const ringDistance = Math.floor(ringSize * n);

    let prevPoint: Coordinates;
    let prevPointIndex = 0;
    let isPrevSide = false;
    if (color) {
      renderer.setColor(color);
    }

    for (let i = 0; i < n; i++) {
      if (!prevPoint) {
        prevPoint = this.getPoint(0);
      }

      const startPoint = prevPoint;
      const positions: Array<Coordinates> = [];
      prevPointIndex = isPrevSide ? i : prevPointIndex + ringDistance;
      prevPoint = this.getPoint(prevPointIndex);
      positions.push(prevPoint);

      renderer.renderLine(startPoint, prevPoint);
      yield;

      if (i < n - 1) {
        prevPointIndex++;
        const nextPoint = this.getPoint(prevPointIndex);
        renderer.renderLine(prevPoint, nextPoint);
        yield;
        prevPoint = nextPoint;
        positions.push(prevPoint);
      }

      isPrevSide = !isPrevSide;
    }
  }

  getRingStepCount(): number {
    return this.config.n * 2 - 1;
  }

  static rotationConfig: ControlConfig<{ rotation?: number }> = {
    key: 'rotation',
    label: 'Rotation',
    defaultValue: 0,
    type: 'range',
    attr: {
      min: 0,
      max: 1 + 1 / 360,
      step: 1 / 360,
      snap: '0.25, 0.5, 0.75',
    },
    displayValue: ({ rotation }) => formatFractionAsAngle(rotation),
    isStructural: true,
    affectsStepCount: false,
  };

  static nailsConfig: Readonly<ControlConfig<CircleConfig>> = {
    key: 'n',
    label: 'Number of nails',
    defaultValue: 144,
    type: 'range',
    attr: {
      min: 3,
      max: 300,
      step: 1,
    },
    isStructural: true,
  };

  static displacementConfig: Readonly<ControlConfig<CircleConfig>> = {
    key: 'displacement',
    label: 'Displacement',
    type: 'group',
    children: [
      {
        key: 'displacementFunc',
        label: 'Displacement function',
        defaultValue: 'linear',
        type: 'select',
        options: Object.keys(easing),
        isStructural: true,
        affectsStepCount: false,
      },
      {
        key: 'displacementMag',
        label: 'Displacement magnitude',
        defaultValue: 3,
        type: 'range',
        attr: {
          min: 0,
          max: 10,
          step: 0.1,
        },
        // @ts-ignore
        show: ({ displacementFunc }) => easing[displacementFunc].requirePower,
        isStructural: true,
        affectsStepCount: false,
      },
      {
        key: 'displacementFastArea',
        label: 'Displacement fast area',
        defaultValue: 0.4,
        type: 'range',
        attr: {
          min: 0,
          max: 0.5,
          step: 0.01,
        },
        show: ({ displacementFunc }) =>
          // @ts-ignore
          easing[displacementFunc].requireFastArea,
        isStructural: true,
        affectsStepCount: false,
      },
    ],
  };

  static distortionConfig: Readonly<ControlConfig<{ distortion?: number }>> = {
    key: 'distortion',
    label: 'Distortion',
    defaultValue: 0,
    type: 'range',
    attr: {
      min: -0.99,
      max: 0.99,
      step: 0.01,
      snap: '0',
    },
    isStructural: true,
    affectsStepCount: false,
  };
}
