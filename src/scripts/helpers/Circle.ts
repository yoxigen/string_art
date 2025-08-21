import Nails from '../Nails';
import Renderer from '../renderers/Renderer';
import { ControlConfig, GroupValue } from '../types/config.types';
import { Coordinates, Dimensions } from '../types/general.types';
import { Nail } from '../types/stringart.types';
import { ColorValue } from './color/color.types';
import easing from './easing';
import { fitInside, PI2 } from './math_utils';
import { compareObjects } from './object_utils';

export interface CircleConfig {
  n: number;
  size: Dimensions;
  margin?: number;
  rotation: number;
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
}

export default class Circle {
  points: Map<number, Coordinates>;
  easingFunction: Function;
  config: CircleConfig;
  center: Coordinates;
  xyRadius: Dimensions;
  rotationAngle: number = 0;
  indexAngle: number;
  isReverse: boolean = false;
  radius: number;
  arc: number = PI2;

  constructor(config: CircleConfig) {
    this.setConfig(config);
  }

  getPoint(index = 0) {
    const realIndex = this.getNailIndex(index);

    if (this.points.has(index)) {
      return this.points.get(index);
    }

    const angle =
      this.easingFunction(realIndex / this.config.n) * this.arc +
      this.rotationAngle +
      (this.config.angleStart ?? 0);

    const point: Coordinates = [
      this.center[0] + Math.sin(angle) * this.xyRadius[0],
      this.center[1] + Math.cos(angle) * this.xyRadius[1],
    ];

    this.points.set(index, point);
    return point;
  }

  getNailIndex(index = 0) {
    let realIndex = this.isReverse ? this.config.n - 1 - index : index;
    if (realIndex > this.config.n - 1) {
      realIndex = realIndex % this.config.n;
    }
    return realIndex;
  }

  setConfig(config: CircleConfig) {
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
      const center = configCenter ?? size.map(v => v / 2);
      const clampedRadius = radius ?? Math.min(...center) - margin;
      let xyRadius = [clampedRadius, clampedRadius];

      if (config.distortion) {
        const distortedBox =
          config.distortion < 0
            ? [clampedRadius * (1 - Math.abs(config.distortion)), clampedRadius]
            : [clampedRadius / (1 - config.distortion), clampedRadius];

        xyRadius = fitInside(
          distortedBox,
          center.map(v => v - margin)
        );
      }

      // Normally, the whole circle is rendered, but if angleStart and angleEnd are configured and valid, and arc between them is rendered:
      const arc =
        angleStart && angleEnd && angleEnd > angleStart
          ? angleEnd - angleStart
          : PI2;

      const props = {
        center,
        radius: clampedRadius,
        xyRadius,
        indexAngle: arc / n,
        rotationAngle: -PI2 * rotation,
        isReverse: reverse,
        arc,
      };

      const easingFunction = config.displacementFunc
        ? easing[config.displacementFunc]
        : easing.linear;
      const easingParams = [];
      if (easingFunction.requirePower) {
        easingParams.push(config.displacementMag);
      }
      if (easingFunction.requireFastArea) {
        easingParams.push(config.displacementFastArea);
      }
      const easingFunctionWithParams = easingParams.length
        ? easingFunction.bind(null, ...easingParams)
        : easingFunction;

      this.easingFunction = easingFunctionWithParams;
      this.config = config;
      Object.assign(this, props);
      if (this.points) {
        this.points.clear();
      } else {
        this.points = new Map();
      }
    }
  }

  *generateNails({
    nailsNumberStart = 0,
    getNumber,
  }: {
    nailsNumberStart?: number;
    getNumber?: (n: number) => number | string;
  } = {}): Generator<Nail> {
    for (let i = 0; i < this.config.n; i++) {
      yield {
        point: this.getPoint(i),
        number: getNumber ? getNumber(i) : i + nailsNumberStart,
      };
    }
  }

  /**
   * Given a Nails instance, uses it to draw the nails of this Circle
   * @param {Nails} nails
   * @param {{nailsNumberStart?: number, getNumber?: Function}} param1
   */
  drawNails(
    nails: Nails,
    props: {
      nailsNumberStart?: number;
      getNumber?: (n: number) => number | string;
    } = {}
  ) {
    for (const nail of this.generateNails(props)) {
      nails.addNail(nail);
    }
  }

  *drawRing(
    renderer: Renderer,
    { ringSize, color }: { ringSize: number; color: ColorValue }
  ): Generator<void> {
    const { n } = this.config;
    const ringDistance = Math.floor(ringSize * n);

    let prevPoint: Coordinates;
    let prevPointIndex = 0;
    let isPrevSide = false;
    renderer.setColor(color);

    for (let i = 0; i < n; i++) {
      if (!prevPoint) {
        prevPoint = this.getPoint(0);
      }

      const startPoint = prevPoint;
      const positions: Array<Coordinates> = [];
      prevPointIndex = isPrevSide ? i : prevPointIndex + ringDistance;
      prevPoint = this.getPoint(prevPointIndex);
      positions.push(prevPoint);

      if (i < n - 1) {
        prevPointIndex++;
        prevPoint = this.getPoint(prevPointIndex);
        positions.push(prevPoint);
      }

      renderer.renderLines(startPoint, ...positions);
      yield;

      isPrevSide = !isPrevSide;
    }
  }

  static rotationConfig: ControlConfig<{ rotation: number }> = {
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
    displayValue: ({ rotation }) => `${Math.round(rotation * 360)}°`,
    isStructural: true,
    affectsStepCount: false,
  };

  static nailsConfig = Object.freeze({
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
  });

  static displacementConfig: ControlConfig<CircleConfig> = {
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
          easing[displacementFunc].requireFastArea,
        isStructural: true,
        affectsStepCount: false,
      },
    ],
  };

  static distortionConfig: ControlConfig<{ distortion?: number }> = {
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
