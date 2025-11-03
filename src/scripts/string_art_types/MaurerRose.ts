import StringArt from '../infra/StringArt';
import Circle from '../shapes/Circle';
import Polygon from '../shapes/Polygon';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorMap } from '../helpers/color/color.types';
import { withoutAttribute } from '../helpers/config_utils';
import { gcd, PI2 } from '../helpers/math_utils';
import { getCenter, mapDimensions } from '../helpers/size_utils';
import Renderer from '../infra/renderers/Renderer';
import { ControlsConfig } from '../types/config.types';
import { Coordinates, Dimensions } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';
import Nails from '../infra/nails/Nails';
import NailsGroup from '../infra/nails/NailsGroup';
import INails from '../infra/nails/INails';

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
  center: Coordinates;
}

export default class MaurerRose extends StringArt<MaurerRoseConfig, TCalc> {
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

  color: Color;
  colorMap: ColorMap;

  resetStructure() {
    super.resetStructure();
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    const { isMultiColor, colorCount } = this.config;

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
      nailsPerSide: 10,
      margin,
      rotation,
      center: getCenter(size),
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
      center: getCenter(size),
    };
  }

  getPoint(index: number): Coordinates {
    const { rotationAngle, angleRadians, radius, center } = this.calc;

    const k = index * angleRadians;
    const r = radius * Math.sin(this.config.n * k);

    const point = [
      center[0] - r * Math.cos(k - rotationAngle),
      center[1] - r * Math.sin(k - rotationAngle),
    ] as Coordinates;
    return point;
  }

  *generatePoints(): Generator<number> {
    const count = this.getStepCount();

    for (let i = 0; i < count + 1; i++) {
      yield i;
    }
  }

  *drawStrings(renderer: Renderer): Generator<void> {
    const points = this.generatePoints();

    let prevPoint: Coordinates;
    renderer.setColor(this.color.getColor(0));

    for (const index of points) {
      const point = this.nails.getNailCoordinates(index);
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

      renderer.renderLine(prevPoint, point);
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

  drawNails(nails: INails) {
    const points = this.generatePoints();
    for (const index of points) {
      nails.addNail(index, this.getPoint(index));
    }
  }
}
