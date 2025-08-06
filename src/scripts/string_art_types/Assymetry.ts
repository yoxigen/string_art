import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';

const LAYER_DEFAULTS = [
  { size: 0.25, end: 1, color: '#a94fb0' },
  { size: 0.125, end: 0.888, color: '#ec6ad0' },
  { size: 0, end: 0.826, color: '#f08ad5', reverse: true },
];

export default class Assymetry extends StringArt {
  name = 'Assymetry';
  id = 'assymetry';
  link =
    'https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for';
  controls = [
    Circle.nailsConfig,
    Circle.rotationConfig,
    Circle.distortionConfig,
    {
      key: 'layers',
      label: 'Layers',
      type: 'group',
      children: LAYER_DEFAULTS.map(({ size, end, color, reverse }, i) => {
        const layer = i + 1;
        return {
          key: `layer${layer}`,
          label: `Layer ${layer}`,
          type: 'group',
          children: [
            {
              key: `show${layer}`,
              label: 'Enable',
              defaultValue: true,
              type: 'checkbox',
            },
            {
              key: `size${layer}`,
              label: 'Size',
              defaultValue: size,
              type: 'range',
              attr: {
                min: 0,
                max: 0.5,
                step: ({ n }) => 1 / n,
              },
              displayValue: config =>
                Math.round(config.n * config[`size${layer}`]),
              show: config => config[`show${layer}`],
            },
            {
              key: `end${layer}`,
              label: 'End Position',
              defaultValue: end,
              type: 'range',
              attr: {
                min: 0,
                max: 1,
                step: ({ n }) => 1 / n,
              },
              displayValue: config =>
                Math.round(config.n * config[`end${layer}`]),
              show: config => config[`show${layer}`],
            },
            {
              key: `color${layer}`,
              label: 'Color',
              defaultValue: color,
              type: 'color',
              show: config => config[`show${layer}`],
            },
            {
              key: `reverse${layer}`,
              label: 'Reverse',
              defaultValue: reverse === true,
              type: 'checkbox',
              show: config => config[`show${layer}`],
            },
          ],
        };
      }),
    },
  ];

  setUpDraw() {
    super.setUpDraw();
    Object.assign(this, this.getSetUp());
  }

  getSetUp() {
    const { rotation, n, margin = 0, distortion } = this.config;
    const size = this.getSize();

    const circleConfig = {
      size,
      n,
      margin,
      rotation: rotation - 0.25,
      distortion,
    };

    let circle;
    if (this.circle) {
      circle = this.circle;
      this.circle.setConfig(circleConfig);
    } else {
      circle = new Circle(circleConfig);
    }

    let lineSpacing = circle.indexAngle * circle.radius;
    const lineNailCount = Math.floor(circle.radius / lineSpacing) - 1;
    lineSpacing +=
      (circle.radius - lineSpacing * lineNailCount) / lineNailCount;
    const firstCirclePoint = circle.getPoint(0);
    const totalNailCount = lineNailCount + n;
    const totalIndexCount = totalNailCount + lineNailCount;
    const layers = new Array(3)
      .fill(null)
      .map((_, i) => getLayer.call(this, i + 1))
      .filter(({ enable }) => enable);

    return {
      circle,
      lineSpacing,
      lineNailCount,
      firstCirclePoint,
      layers,
      totalNailCount,
      totalIndexCount,
    };

    function getLayer(layerIndex) {
      const size =
        Math.round(n * this.config['size' + layerIndex]) + lineNailCount;
      return {
        size,
        endIndex:
          Math.round(
            this.config['end' + layerIndex] * (totalNailCount + lineNailCount)
          ) - size,
        color: this.config['color' + layerIndex],
        enable: this.config['show' + layerIndex],
        isReverse: this.config['reverse' + layerIndex],
      };
    }
  }

  /**
   * Returns the position of a point on the line
   * @param {index of the point in the circle, 0 is the center} index
   */
  getPoint(index) {
    if (index < this.lineNailCount || index > this.totalNailCount) {
      const linePosition =
        index < this.lineNailCount
          ? this.lineNailCount - index
          : index - this.totalNailCount;

      const indexLength = linePosition * this.lineSpacing;
      return [
        this.firstCirclePoint[0] -
          indexLength * Math.sin(this.circle.rotationAngle),
        this.firstCirclePoint[1] -
          indexLength * Math.cos(this.circle.rotationAngle),
      ];
    } else {
      const circleIndex = index - this.lineNailCount;
      return this.circle.getPoint(circleIndex);
    }
  }

  *drawCircle({ endIndex, color, isReverse, size }) {
    let prevPoint;
    let prevPointIndex;
    let isPrevSide = false;
    this.renderer.setColor(color);
    const self = this;
    const advance = isReverse ? -1 : 1;

    for (let index = 0; index <= endIndex; index++) {
      const startPoint = prevPoint ?? this.getPoint(getPointIndex(index));
      const positions = [];
      if (prevPoint) {
        positions.push(this.getPoint(prevPointIndex + advance));
      }
      prevPointIndex = getPointIndex(isPrevSide ? index : index + size);
      positions.push((prevPoint = this.getPoint(prevPointIndex)));

      this.renderer.renderLines(startPoint, ...positions);

      yield;

      isPrevSide = !isPrevSide;
    }

    function getPointIndex(index) {
      return isReverse ? self.totalIndexCount - index : index;
    }
  }

  *generateStrings() {
    for (const layer of this.layers) {
      yield* this.drawCircle(layer);
    }
  }

  drawNails() {
    this.circle.drawNails(this.nails, { nailsNumberStart: this.lineNailCount });

    for (let i = 0; i < this.lineNailCount; i++) {
      this.nails.addNail({ point: this.getPoint(i), number: i });
    }
  }

  getStepCount() {
    const { layers } = this.getSetUp();
    return layers.reduce(
      (stepCount, layer) => stepCount + layer.endIndex + 1,
      0
    );
  }

  static thumbnailConfig = {
    n: 50,
  };
}
