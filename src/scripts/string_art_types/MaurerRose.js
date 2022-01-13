import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';
import Color from '../helpers/Color.js';
import { gcd } from '../helpers/math_utils.js';

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#ffffff',
    multicolorRange: 133,
    multicolorStart: 239,
    multicolorByLightness: false,
    minLightness: 30,
    maxLightness: 70,
    colorCount: 4,
  },
});

const SINGLE_DENSITY_STEPS = 360;
const WHOLE_NUMBER_PRECISION = 6;
const WHOLE_NUMBER_PRECISION_DELTA = 10 ** (-1 * WHOLE_NUMBER_PRECISION);

export default class MaurerRose extends StringArt {
  name = 'Maurer Rose';
  id = 'maurer_rose';
  link = 'https://en.wikipedia.org/wiki/Maurer_rose';
  linkText = 'Wiki';
  controls = [
    {
      key: 'n',
      label: 'N',
      defaultValue: 4,
      type: 'range',
      attr: {
        min: 1,
        max: 12,
        step: 1,
      },
    },
    {
      key: 'nailsCount',
      label: 'Nails count',
      defaultValue: 512,
      type: 'range',
      attr: {
        min: 3,
        max: 999,
        step: 1,
      },
    },
    {
      key: 'angle',
      label: 'Angle',
      defaultValue: 341,
      type: 'range',
      attr: {
        min: 1,
        max: 360,
        step: 1,
      },
      displayValue: ({ angle }) => `${angle}°`,
    },
    Circle.rotationConfig,
    COLOR_CONFIG,
  ];

  setUpDraw() {
    super.setUpDraw();
    const { isMultiColor, colorCount, rotation, n, margin } = this.config;
    const structureProps = this.getStructureProps();
    const structureChanged = Object.entries(structureProps).some(
      ([key, value]) =>
        key === 'currentSize'
          ? value.join(',') !== this[key].join(',')
          : value !== this[key]
    );

    if (structureChanged) {
      if (this.points) {
        this.points.clear();
      } else {
        this.points = new Map();
      }
      Object.assign(this, structureProps);
      this.stepCount = null;
      this.stepCount = this.getStepCount();
    }

    this.color = new Color({
      ...this.config,
      isMultiColor,
      colorCount,
    });

    if (isMultiColor) {
      this.colorMap = this.color.getColorMap({
        stepCount: this.stepCount,
        colorCount,
      });
    } else {
      this.colorMap = null;
    }
  }

  getPetalsCount() {
    const { n } = this.config;
    return n % 2 ? n : n * 2;
  }

  getStructureProps() {
    const { n, angle, rotation, nailsCount } = this.config;
    const size = this.getSize();
    const density = nailsCount / SINGLE_DENSITY_STEPS;

    return {
      n,
      angleRadians: (angle * Math.PI) / 180 / density,
      radius: Math.min(...size) / 2,
      currentSize: size,
      rotationAngle: -Math.PI * 2 * rotation,
    };
  }

  getPoint(index) {
    if (this.points.has(index)) {
      return this.points.get(index);
    }

    const k = index * this.angleRadians;
    const r = this.radius * Math.sin(this.n * k);

    const point = [
      this.center[0] - r * Math.cos(k - this.rotationAngle),
      this.center[1] - r * Math.sin(k - this.rotationAngle),
    ];
    this.points.set(index, point);
    return point;
  }

  *generatePoints() {
    const count = this.stepCount;

    for (let i = 0; i < count + 1; i++) {
      yield { point: this.getPoint(i), index: i };
    }
  }

  *generateStrings() {
    const points = this.generatePoints();

    let prevPoint;

    this.ctx.strokeStyle = this.color.getColor(0);

    for (const { point, index } of points) {
      if (!prevPoint) {
        prevPoint = point;
        continue;
      }

      if (this.colorMap) {
        const stepColor = this.colorMap.get(index);
        if (stepColor) {
          this.ctx.strokeStyle = stepColor;
        }
      }

      this.ctx.beginPath();
      this.ctx.moveTo(...prevPoint);
      prevPoint = point;
      this.ctx.lineTo(...point);
      this.ctx.stroke();

      yield;
    }
  }

  getStepCount() {
    if (this.stepCount) {
      return this.stepCount;
    }

    const { nailsCount, angle, n } = this.config;
    const angleGcd = gcd(nailsCount, angle);

    let steps = nailsCount / angleGcd;
    if (!(steps % 2) && n % 2) {
      steps /= 2;
    }
    return Math.round(steps);
  }

  drawNails() {
    const points = this.generatePoints();
    for (const { point, index } of points) {
      this.nails.addNail({ point, number: index });
    }
  }

  static thumbnailConfig = {
    nailsCount: 160,
    angle: 213,
  };
}
