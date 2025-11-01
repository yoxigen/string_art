import StringArt from '../infra/StringArt';
import Circle, { CircleConfig } from '../shapes/Circle';
import Renderer from '../infra/renderers/Renderer';
import { ControlsConfig, GroupValue } from '../types/config.types';
import { Coordinates, Dimensions } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';
import Nails from '../infra/nails/Nails';
import { PI2 } from '../helpers/math_utils';
import { formatFractionAsPercent } from '../helpers/string_utils';
import NailsGroup from '../infra/nails/NailsGroup';
import INails from '../infra/nails/INails';

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

export default class Assymetry extends StringArt<AssymetryConfig, TCalc> {
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
              isStructural: true,
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
              isStructural: true,
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
              isStructural: true,
            },
            {
              key: `color${layer}`,
              label: 'Color',
              defaultValue: color,
              type: 'color',
              show: config => config[`show${layer}`],
              affectsNails: false,
              isStructural: true,
            },
            {
              key: `reverse${layer}`,
              label: 'Reverse',
              defaultValue: reverse === true,
              type: 'checkbox',
              show: config => config[`show${layer}`],
              affectsNails: false,
              isStructural: true,
            },
          ],
        };
      }),
    },
  ];

  getAspectRatio(): number {
    const calc = this.calc ?? this.getCalc({ size: [100, 100] });
    return calc.circle.getAspectRatio();
  }

  getCalc({ size }: CalcOptions) {
    const { rotation, n, margin = 0, distortion } = this.config;

    const circleConfig: CircleConfig = {
      size,
      n,
      margin,
      rotation: rotation - 0.25,
      distortion,
    };

    const circle = new Circle(circleConfig);

    const circleDistanceBetweenPoints = (PI2 * circle.radius) / n;

    const lineSize = circle.radius;
    const lineNailCount = Math.round(lineSize / circleDistanceBetweenPoints);
    const lineSpacing = lineSize / lineNailCount;
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
    if (index < this.calc.lineNailCount || index > this.calc.totalNailCount) {
      const linePosition =
        index < this.calc.lineNailCount
          ? this.calc.lineNailCount - index
          : index - this.calc.totalNailCount;

      const indexLength = linePosition * this.calc.lineSpacing;
      return [
        this.calc.firstCirclePoint[0] -
          indexLength * Math.sin(this.calc.circle.rotationAngle),
        this.calc.firstCirclePoint[1] -
          indexLength * Math.cos(this.calc.circle.rotationAngle),
      ];
    } else {
      const circleIndex = index - this.calc.lineNailCount;
      return this.calc.circle.getPoint(circleIndex);
    }
  }

  *drawCircle(
    renderer: Renderer,
    { endIndex, color, isReverse, size }
  ): Generator<void> {
    let prevPoint: Coordinates;
    let prevPointIndex: number;
    let isPrevSide = false;
    renderer.setColor(color);
    const self = this;
    const advance = isReverse ? -1 : 1;

    for (let index = 0; index <= endIndex; index++) {
      if (prevPoint) {
        renderer.renderLine(prevPoint, this.getPoint(prevPointIndex + advance));
        yield;
      }

      const startPoint = prevPoint
        ? this.getPoint(prevPointIndex + advance)
        : this.getPoint(getPointIndex(index));
      prevPointIndex = getPointIndex(isPrevSide ? index : index + size);
      prevPoint = this.getPoint(prevPointIndex);

      renderer.renderLine(startPoint, prevPoint);

      yield;

      isPrevSide = !isPrevSide;
    }

    function getPointIndex(index: number): number {
      return isReverse ? self.calc.totalIndexCount - index : index;
    }
  }

  *drawStrings(renderer: Renderer) {
    for (const layer of this.calc.layers) {
      yield* this.drawCircle(renderer, layer);
    }
  }

  drawNails(nails: INails) {
    for (let i = 0; i < this.calc.lineNailCount; i++) {
      nails.addNail(-i, this.getPoint(i));
    }
    this.calc.circle.drawNails(nails);
  }

  getStepCount(options: CalcOptions): number {
    const { layers } = this.getCalc(options);
    return layers.reduce(
      (stepCount, layer) => stepCount + layer.endIndex * 2 + 1,
      0
    );
  }

  getNailCount(size: Dimensions): number {
    const calc = this.getCalc({
      size,
    });
    return calc.circle.config.n + calc.lineNailCount;
  }

  thumbnailConfig = ({ n }) => ({ n: Math.min(n, 50) });
}
