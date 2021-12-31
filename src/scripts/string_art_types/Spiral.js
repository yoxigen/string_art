import Color from '../helpers/Color.js';
import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';

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
      defaultValue: 6,
      type: 'range',
      attr: { min: 1, max: 20, step: 1 },
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
    const { n, rotation, layers, margin, colorCount, repetition } = this.config;
    this.layersCount = layers ?? 1;
    this.realRepetition = repetition * 2 - 1;

    const circleConfig = {
      size: this.size,
      n,
      margin,
      rotation,
    };

    if (this.circle) {
      this.circle.setConfig(circleConfig);
    } else {
      this.circle = new Circle(circleConfig);
    }

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
    const { innerLength, n } = this.config;

    let currentInnerLength = Math.round(innerLength * n);
    let repetitionCount = 0;
    this.ctx.strokeStyle = color;
    let prevPointIndex = shift;
    let prevPoint = this.circle.getPoint(prevPointIndex);
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
      prevPointIndex = isPrevPoint
        ? prevPointIndex - currentInnerLength + 1
        : prevPointIndex + currentInnerLength;

      if (repetitionCount === this.realRepetition) {
        currentInnerLength--;
        repetitionCount = 0;
        prevPointIndex++;
      } else {
        repetitionCount++;
      }

console.log("GO TO " + prevPointIndex)
      prevPoint = this.circle.getPoint(prevPointIndex);
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
    const { innerLength, repetition, n, layers = 1 } = this.config;
    return Math.round(layers * n * (innerLength * 2) * repetition);
  }

  drawNails() {
    this.circle.drawNails(this.nails);
  }

  static thumbnailConfig = {
    n: 60,
  };
}
