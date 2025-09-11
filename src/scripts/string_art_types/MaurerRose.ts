import StringArt from '../StringArt';
import Circle from '../shapes/Circle';
import Polygon from '../shapes/Polygon';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorMap } from '../helpers/color/color.types';
import { withoutAttribute } from '../helpers/config_utils';
import { gcd, PI2 } from '../helpers/math_utils';
import { mapDimensions } from '../helpers/size_utils';
import Renderer from '../renderers/Renderer';
import { ControlsConfig } from '../types/config.types';
import { Coordinates, Dimensions } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';

export interface MaurerRoseConfig extends ColorConfig {
  n: number;
  maxSteps: number;
  angle: number;
  rotation: number;
}

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#ffffff',
    multicolorRange: 102,
    multicolorStart: 239,
    multicolorByLightness: false,
    minLightness: 30,
    maxLightness: 70,
    colorCount: 4,
  },
  exclude: ['repeatColors', 'mirrorColors'],
});

interface TCalc {
  angleRadians: number;
  radius: number;
  currentSize: Dimensions;
  rotationAngle: number;
}

export default class MaurerRose extends StringArt<MaurerRoseConfig> {
  static type = 'maurer_rose';

  name = 'Maurer Rose';
  id = 'maurer_rose';
  link = 'https://blog.glitch.land/en/posts/maurer-rose/';
  linkText = 'Learn';
  controls: ControlsConfig<MaurerRoseConfig> = [
    {
      key: 'n',
      label: 'N',
      defaultValue: 4,
      type: 'range',
      attr: {
        min: 2,
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
    withoutAttribute(Circle.rotationConfig, 'snap'),
    COLOR_CONFIG,
  ];

  calc: TCalc;
  points: Map<number, Coordinates>;
  color: Color;
  colorMap: ColorMap;

  resetStructure() {
    super.resetStructure();

    if (this.points) {
      this.points.clear();
    }
    this.calc = null;
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw();
    const { isMultiColor, colorCount } = this.config;

    if (!this.calc) {
      this.calc = this.getCalc(options);
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

  getAspectRatio({ size }: CalcOptions): number {
    const { n, rotation, margin } = this.config;

    // Use a Polygon and getBoundingRect to calculate the aspectRatio
    const polygon = new Polygon({
      size,
      sides: n % 2 ? n : n * 2,
      nailsSpacing: 0.1,
      margin,
      rotation,
      center: size.map(v => v / 2) as Dimensions,
    });

    return polygon.getAspectRatio();
  }

  getCalc({ size }: CalcOptions): TCalc {
    const { angle, rotation, maxSteps, margin } = this.config;

    return {
      angleRadians: (PI2 * angle) / maxSteps,
      radius: Math.min(...size) / 2 - margin,
      currentSize: mapDimensions(size, v => v - margin * 2),
      rotationAngle: -Math.PI * 2 * rotation,
    };
  }

  getPoint(index: number): Coordinates {
    const { rotationAngle, angleRadians, radius } = this.calc;

    if (this.points.has(index)) {
      return this.points.get(index);
    }

    const k = index * angleRadians;
    const r = radius * Math.sin(this.config.n * k);

    const point = [
      this.center[0] - r * Math.cos(k - rotationAngle),
      this.center[1] - r * Math.sin(k - rotationAngle),
    ] as Coordinates;
    this.points.set(index, point);
    return point;
  }

  *generatePoints(): Generator<{ point: Coordinates; index: number }> {
    const count = this.stepCount;

    for (let i = 0; i < count + 1; i++) {
      yield { point: this.getPoint(i), index: i };
    }
  }

  *drawStrings(renderer: Renderer): Generator<void> {
    const points = this.generatePoints();

    let prevPoint: Coordinates;
    renderer.setColor(this.color.getColor(0));

    for (const { point, index } of points) {
      if (!prevPoint) {
        prevPoint = point;
        continue;
      }

      if (this.colorMap) {
        const stepColor = this.colorMap.get(index);
        if (stepColor) {
          renderer.setColor(stepColor);
        }
      }

      renderer.renderLines(prevPoint, point);
      prevPoint = point;

      yield;
    }
  }

  getStepCount(): number {
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
}
