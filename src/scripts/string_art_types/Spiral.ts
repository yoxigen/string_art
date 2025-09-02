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

  #realRepetition: number;
  #circle: Circle;
  #color: Color;
  #colorMap: ColorMap;

  setUpDraw() {
    super.setUpDraw();
    const { n, rotation, margin, colorCount, repetition, distortion } =
      this.config;
    this.#realRepetition = repetition * 2 - 1;

    const circleConfig = {
      size: this.size,
      n,
      margin,
      rotation,
      distortion,
    };

    if (this.#circle) {
      this.#circle.setConfig(circleConfig);
    } else {
      this.#circle = new Circle(circleConfig);
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
    let prevPoint = this.#circle.getPoint(prevPointIndex);
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

      if (repetitionCount === this.#realRepetition) {
        currentInnerLength--;
        repetitionCount = 0;
        prevPointIndex++;
      } else {
        repetitionCount++;
      }

      const nextPoint = this.#circle.getPoint(prevPointIndex);

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
    this.#circle.drawNails(this.nails);
  }

  static thumbnailConfig = {
    n: 60,
  };
}
