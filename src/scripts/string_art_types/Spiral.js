import Color from '../helpers/Color.js';
import StringArt from '../StringArt.js';
import Circle from './Circle.js';

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    colorCount: 7,
    color: '#ffbb29',
    multicolorRange: '21',
    multicolorStart: 32,
    multicolorByLightness: true,
    minLightness: 36,
    maxLightness: 98,
  },
});

export default class Spiral extends StringArt {
  id = 'spiral';
  name = 'Spiral';
  link =
    'https://www.etsy.com/il-en/listing/840974781/boho-wall-decor-artwork-spiral-round';
  controls = [
    {
      ...Circle.nailsConfig,
      defaultValue: 200,
    },
    {
      key: 'repetition',
      label: 'Repetition',
      defaultValue: 5,
      type: 'range',
      attr: { min: 1, max: 60, step: 1 },
    },
    {
      key: 'innerLength',
      label: 'Spiral thickness',
      defaultValue: 0.5,
      type: 'range',
      attr: {
        min: ({ config: { n } }) => 1 / n,
        max: 1,
        step: ({ config: { n } }) => 1 / n,
      },
      displayValue: ({ n, innerLength }) => Math.round(n * innerLength),
    },
    {
      ...Circle.rotationConfig,
      defaultValue: 0.75,
    },
    COLOR_CONFIG,
  ];

  setUpDraw() {
    super.setUpDraw();
    const { n, rotation, layers, margin, colorCount } = this.config;
    this.layersCount = layers ?? 1;

    this.circle = new Circle({
      size: this.size,
      n,
      rotation,
      margin,
    });

    this.color = new Color({
      ...this.config,
      colorCount: layers ?? colorCount,
    });

    if (colorCount) {
      this.colorMap = this.color.getColorMap({
        stepCount: this.getStepCount(),
        colorCount,
      });
    }
  }

  *drawSpiral({ shift = 0, color = '#ffffff' } = {}) {
    const { repetition, innerLength, n } = this.config;

    let currentInnerLength = Math.round(innerLength * n);
    let repetitionCount = 0;
    this.ctx.strokeStyle = color;
    let prevPoint = this.circle.getPoint(shift);
    let isPrevPoint = false;

    for (let i = 0; currentInnerLength > 0; i++) {
      if (this.colorMap) {
        const stepColor = this.colorMap.get(i);
        if (stepColor) {
          this.ctx.strokeStyle = stepColor;
        }
      }

      this.ctx.beginPath();
      this.ctx.moveTo(...prevPoint);
      const nextPointIndex = isPrevPoint
        ? i + shift
        : i + currentInnerLength + shift;

      this.ctx.lineTo(...this.circle.getPoint(nextPointIndex));
      repetitionCount++;
      if (repetitionCount === repetition) {
        currentInnerLength--;
        repetitionCount = 0;
        i++;
        this.ctx.lineTo(...this.circle.getPoint(nextPointIndex + 1));
        prevPoint = this.circle.getPoint(nextPointIndex + 2);
      } else {
        prevPoint = this.circle.getPoint(nextPointIndex + 1);
      }

      this.ctx.lineTo(...prevPoint);
      this.ctx.stroke();

      yield i;
      isPrevPoint = !isPrevPoint;
    }
  }

  *generateStrings() {
    yield* this.drawSpiral({
      color: this.color.getColor(0),
    });
  }

  getStepCount() {
    const { innerLength, repetition, n } = this.config;
    return this.layersCount * Math.round(innerLength * n) * repetition;
  }

  drawNails() {
    this.circle.drawNails(this.nails);
  }

  static thumbnailConfig = {
    n: 60,
  };
}
