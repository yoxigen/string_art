import Nails from '../Nails.js';
import easing from './easing.js';
import { PI2 } from './math_utils.js';

export default class Circle {
  constructor(config) {
    this.setConfig(config);
  }

  getPoint(index = 0) {
    const realIndex = this.getNailIndex(index);

    if (this.points.has(index)) {
      return this.points.get(index);
    }

    const angle =
      easing.linear(realIndex / this.config.n) * PI2 + this.rotationAngle;
    const point = [
      this.center[0] + Math.sin(angle) * this.radius,
      this.center[1] - Math.cos(angle) * this.radius,
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

  setConfig(config) {
    const serializedConfig = this._serializeConfig(config);
    if (serializedConfig !== this.serializedConfig) {
      const {
        n,
        size,
        margin = 0,
        rotation = 0,
        center: configCenter,
        radius,
        reverse = false,
      } = config;
      const center = configCenter ?? size.map(v => v / 2);
      const props = {
        center,
        radius: radius ?? Math.min(...center) - margin,
        indexAngle: PI2 / n,
        rotationAngle: -PI2 * rotation,
        isReverse: reverse,
      };
      this.config = config;
      this.serializedConfig = serializedConfig;
      Object.assign(this, props);
      if (this.points) {
        this.points.clear();
      } else {
        this.points = new Map();
      }
    }
  }

  _serializeConfig({
    n,
    size,
    margin = 0,
    rotation = 0,
    center,
    radius,
    reverse = false,
  }) {
    return [
      size?.join(','),
      center?.join(','),
      radius,
      margin,
      n,
      rotation,
      reverse,
    ].join('_');
  }

  /**
   * Given a Nails instance, uses it to draw the nails of this Circle
   * @param {Nails} nails
   * @param {{nailsNumberStart?: number, getNumber?: Function}} param1
   */
  drawNails(nails, { nailsNumberStart = 0, getNumber } = {}) {
    for (let i = 0; i < this.config.n; i++) {
      nails.addNail({
        point: this.getPoint(i),
        number: getNumber ? getNumber(i) : i + nailsNumberStart,
      });
    }
  }

  *drawRing(renderer, { ringSize, color }) {
    const { n } = this.config;
    const ringDistance = Math.floor(ringSize * n);

    let prevPoint;
    let prevPointIndex = 0;
    let isPrevSide = false;
    renderer.setColor(color);

    for (let i = 0; i < n; i++) {
      if (!prevPoint) {
        prevPoint = this.getPoint(0);
      }

      const startPoint = prevPoint;
      const positions = [];
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

  static rotationConfig = Object.freeze({
    key: 'rotation',
    label: 'Rotation',
    defaultValue: 0,
    type: 'range',
    attr: {
      min: 0,
      max: 1 + 1 / 360,
      step: 1 / 360,
    },
    displayValue: (config, { key }) => `${Math.round(config[key] * 360)}°`,
    isStructural: true,
    affectsStepCount: false,
  });

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
}
