import StringArt from '../StringArt';
import Circle, { CircleConfig } from '../helpers/Circle';
import { ControlsConfig, GroupValue } from '../types/config.types.js';
import { Coordinates } from '../types/general.types';

const LAYER_DEFAULTS = [
  { size: 0.25, end: 1, color: '#a94fb0' },
  { size: 0.125, end: 0.888, color: '#ec6ad0' },
  { size: 0, end: 0.826, color: '#f08ad5', reverse: true },
];

interface AssymetryConfig extends CircleConfig {
  layers: GroupValue;
  layer1: GroupValue;
  show1: boolean;
  size1: number;
  end1: number;
  color1: number;
  reverse1: number;

  layer2: GroupValue;
  show2: boolean;
  size2: number;
  end2: number;
  color2: number;
  reverse2: number;

  layer3: GroupValue;
  show3: boolean;
  size3: number;
  end3: number;
  color3: number;
  reverse3: number;

  distortion: number;
}

interface Layer {
  enable: boolean;
  size: number;
  endIndex: number;
  color: number;
  isReverse: number;
}

interface TCalc {
  circle: Circle;
  lineSpacing: number;
  lineNailCount: number;
  firstCirclePoint: Coordinates;
  layers: ReadonlyArray<Layer>;
  totalNailCount: number;
  totalIndexCount: number;
}

export default class Assymetry extends StringArt<AssymetryConfig> {
  static type = 'assymetry';

  name = 'Assymetry';
  id = 'assymetry';
  link =
    'https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for';
  controls: ControlsConfig<AssymetryConfig> = [
    Circle.nailsConfig,
    Circle.rotationConfig,
    Circle.distortionConfig,
    {
      key: 'layers',
      label: 'Layers',
      type: 'group',
      // @ts-expect-error: dynamic key is safe because we know the keys match Layers
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
              affectsNails: false,
            },
            {
              key: `color${layer}`,
              label: 'Color',
              defaultValue: color,
              type: 'color',
              show: config => config[`show${layer}`],
              affectsNails: false,
            },
            {
              key: `reverse${layer}`,
              label: 'Reverse',
              defaultValue: reverse === true,
              type: 'checkbox',
              show: config => config[`show${layer}`],
              affectsNails: false,
            },
          ],
        };
      }),
    },
  ];

  #circle: Circle;
  #calc: TCalc;

  setUpDraw() {
    super.setUpDraw();
    this.#calc = this.#getCalc();
  }

  #getCalc() {
    const { rotation, n, margin = 0, distortion } = this.config;
    const size = this.getSize();

    const circleConfig: CircleConfig = {
      size,
      n,
      margin,
      rotation: rotation - 0.25,
      distortion,
    };

    let circle: Circle;
    if (this.#calc?.circle) {
      circle = this.#calc.circle;
      this.#calc.circle.setConfig(circleConfig);
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

    function getLayer(layerIndex: number): Layer {
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
   */
  getPoint(index: number): Coordinates {
    if (index < this.#calc.lineNailCount || index > this.#calc.totalNailCount) {
      const linePosition =
        index < this.#calc.lineNailCount
          ? this.#calc.lineNailCount - index
          : index - this.#calc.totalNailCount;

      const indexLength = linePosition * this.#calc.lineSpacing;
      return [
        this.#calc.firstCirclePoint[0] -
          indexLength * Math.sin(this.#calc.circle.rotationAngle),
        this.#calc.firstCirclePoint[1] -
          indexLength * Math.cos(this.#calc.circle.rotationAngle),
      ];
    } else {
      const circleIndex = index - this.#calc.lineNailCount;
      return this.#calc.circle.getPoint(circleIndex);
    }
  }

  *drawCircle({ endIndex, color, isReverse, size }): Generator<void> {
    let prevPoint: Coordinates;
    let prevPointIndex: number;
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

    function getPointIndex(index: number): number {
      return isReverse ? self.#calc.totalIndexCount - index : index;
    }
  }

  *generateStrings() {
    for (const layer of this.#calc.layers) {
      yield* this.drawCircle(layer);
    }
  }

  drawNails() {
    this.#calc.circle.drawNails(this.nails, {
      nailsNumberStart: this.#calc.lineNailCount,
    });

    for (let i = 0; i < this.#calc.lineNailCount; i++) {
      this.nails.addNail({ point: this.getPoint(i), number: i });
    }
  }

  getStepCount(): number {
    const { layers } = this.#getCalc();
    return layers.reduce(
      (stepCount, layer) => stepCount + layer.endIndex + 1,
      0
    );
  }

  static thumbnailConfig = {
    n: 50,
  };
}
