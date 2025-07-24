import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';
import Color from '../helpers/Color.js';
import { gcd, PI2 } from '../helpers/math_utils.js';

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
  exclude: ['repeatColors', 'mirrorColors'],
});

export default class MaurerRose extends StringArt {
  name = 'Maurer Rose';
  id = 'maurer_rose';
  link = 'https://blog.glitch.land/en/posts/maurer-rose/';
  linkText = 'Learn';
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
      isStructural: true,
    },
    {
      key: 'maxSteps',
      label: 'Max steps',
      defaultValue: 512,
      type: 'range',
      attr: {
        min: 3,
        max: 720,
        step: 1,
      },
      isStructural: true,
    },
    {
      key: 'angle',
      label: 'Angle',
      defaultValue: 341,
      type: 'range',
      attr: {
        min: 1,
        max: 720,
        step: 1,
      },
      displayValue: ({ angle }) => `${angle}°`,
      isStructural: true,
    },
    Circle.rotationConfig,
    COLOR_CONFIG,
  ];

  resetStructure() {
    super.resetStructure();

    if (this.points) {
      this.points.clear();
    }
    this.calc = null;
  }

  setUpDraw() {
    super.setUpDraw();
    const { isMultiColor, colorCount } = this.config;

    if (!this.calc) {
      this.calc = this.getCalc();
    }

    if (!this.points) {
      this.points = new Map();
    }

    if (!this.stepCount) {
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

  getCalc() {
    const { n, angle, rotation, maxSteps } = this.config;
    const size = this.getSize();

    return {
      n,
      angleRadians: (PI2 * angle) / maxSteps,
      radius: Math.min(...size) / 2,
      currentSize: size,
      rotationAngle: -Math.PI * 2 * rotation,
    };
  }

  getPoint(index) {
    if (this.points.has(index)) {
      return this.points.get(index);
    }

    const k = index * this.calc.angleRadians;
    const r = this.calc.radius * Math.sin(this.calc.n * k);

    const point = [
      this.center[0] - r * Math.cos(k - this.calc.rotationAngle),
      this.center[1] - r * Math.sin(k - this.calc.rotationAngle),
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
    this.renderer.setColor(this.color.getColor(0));

    for (const { point, index } of points) {
      if (!prevPoint) {
        prevPoint = point;
        continue;
      }

      if (this.colorMap) {
        const stepColor = this.colorMap.get(index);
        if (stepColor) {
          this.renderer.setColor(stepColor);
        }
      }

      this.renderer.renderLines(prevPoint, point);
      prevPoint = point;

      yield;
    }
  }

  getStepCount() {
    if (this.stepCount) {
      return this.stepCount;
    }

    const { maxSteps, angle, n } = this.config;
    const angleGcd = gcd(maxSteps, angle);

    let steps = maxSteps / angleGcd;
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
    maxSteps: 160,
    angle: 213,
  };
}
