import Color from '../helpers/color/Color';
import StringArt from '../StringArt';
import Circle from '../helpers/Circle';
import { ControlsConfig } from '../types/config.types';
import {
  ColorConfig,
  ColorMap,
  ColorValue,
} from '../helpers/color/color.types';
import Renderer from '../renderers/Renderer';
import { CalcOptions } from '../types/stringart.types';

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    colorCount: 7,
    color: '#ffbb29',
    multicolorRange: 21,
    multicolorStart: 32,
    multicolorByLightness: true,
    minLightness: 36,
    maxLightness: 98,
  },
});

interface SpiralConfig extends ColorConfig {
  n: number;
  repetition: number;
  innerLength: number;
  rotation: number;
  distortion: number;
}

type TCalc = {
  circle: Circle;
  realRepetition: number;
};

export default class Spiral extends StringArt<SpiralConfig> {
  static type = 'spiral';

  id = 'spiral';
  name = 'Spiral';
  link =
    'https://www.etsy.com/il-en/listing/840974781/boho-wall-decor-artwork-spiral-round';
  controls: ControlsConfig<SpiralConfig> = [
    {
      ...Circle.nailsConfig,
      defaultValue: 200,
    },
    {
      key: 'repetition',
      label: 'Repetition',
      defaultValue: 5,
      type: 'range',
      attr: { min: 1, max: 20, step: 1 },
      affectsNails: false,
      isStructural: true,
    },
    {
      key: 'innerLength',
      label: 'Spiral thickness',
      defaultValue: 0.5,
      type: 'range',
      attr: {
        min: ({ n }) => 1 / n,
        max: 1,
        step: ({ n }) => 1 / n,
      },
      displayValue: ({ n, innerLength }) => Math.round(n * innerLength),
      affectsNails: false,
    },
    {
      ...Circle.rotationConfig,
      defaultValue: 0.75,
    },
    Circle.distortionConfig,
    COLOR_CONFIG,
  ];

  #color: Color;
  #colorMap: ColorMap;

  calc: TCalc;

  getCalc({ size }: CalcOptions): TCalc {
    const { n, rotation, margin, repetition, distortion } = this.config;

    const circleConfig = {
      size,
      n,
      margin,
      rotation,
      distortion,
    };

    return {
      circle: new Circle(circleConfig),
      realRepetition: repetition * 2 - 1,
    };
  }

  resetStructure(): void {
    this.calc = null;
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw();
    const { colorCount } = this.config;

    if (!this.calc) {
      this.calc = this.getCalc(options);
    }

    this.#color = new Color({
      ...this.config,
      colorCount: colorCount,
    });

    if (colorCount) {
      this.#colorMap = this.#color.getColorMap({
        stepCount: this.getStepCount(),
        colorCount,
      });
    }
  }

  getAspectRatio(options: CalcOptions): number {
    const { circle } = this.getCalc(options);
    return circle.aspectRatio;
  }

  *drawSpiral(
    renderer: Renderer,
    {
      shift = 0,
      color = '#ffffff',
    }: { shift?: number; color?: ColorValue } = {}
  ): Generator<void> {
    const { innerLength, n } = this.config;

    let currentInnerLength = Math.round(innerLength * n);
    let repetitionCount = 0;
    renderer.setColor(color);
    let prevPointIndex = shift;
    let prevPoint = this.calc.circle.getPoint(prevPointIndex);
    let isPrevPoint = false;

    for (let i = 0; currentInnerLength > 0; i++) {
      if (this.#colorMap) {
        const stepColor = this.#colorMap.get(i);
        if (stepColor) {
          renderer.setColor(stepColor);
        }
      }

      prevPointIndex = isPrevPoint
        ? prevPointIndex - currentInnerLength + 1
        : prevPointIndex + currentInnerLength;

      if (repetitionCount === this.calc.realRepetition) {
        currentInnerLength--;
        repetitionCount = 0;
        prevPointIndex++;
      } else {
        repetitionCount++;
      }

      const nextPoint = this.calc.circle.getPoint(prevPointIndex);

      renderer.renderLines(prevPoint, nextPoint);
      prevPoint = nextPoint;

      yield;
      isPrevPoint = !isPrevPoint;
    }
  }

  *drawStrings(renderer: Renderer): Generator<void> {
    yield* this.drawSpiral(renderer, {
      color: this.#color.getColor(0),
    });
  }

  getStepCount(): number {
    const { innerLength, repetition, n } = this.config;
    return Math.round(n * (innerLength * 2) * repetition);
  }

  drawNails() {
    this.calc.circle.drawNails(this.nails);
  }

  static thumbnailConfig = {
    n: 60,
  };
}
