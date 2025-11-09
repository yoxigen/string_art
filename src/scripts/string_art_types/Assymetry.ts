import StringArt from '../infra/StringArt';
import Circle, { CircleConfig } from '../shapes/Circle';
import Renderer from '../infra/renderers/Renderer';
import { ControlsConfig, GroupValue } from '../types/config.types';
import { Coordinates, Dimensions } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';
import { PI2 } from '../helpers/math_utils';
import NailsSetter from '../infra/nails/NailsSetter';
import { createArray } from '../helpers/array_utils';

const LAYER_DEFAULTS = [
  { start: 0.25, end: 1, color: '#a94fb0' },
  { start: 0.125, end: 0.888, color: '#ec6ad0' },
  { start: 0, end: 0.826, color: '#f08ad5', reverse: true },
];

interface AssymetryConfig extends CircleConfig {
  layers: GroupValue;
  layer1: GroupValue;
  show1: boolean;
  start1: number;
  end1: number;
  color1: number;
  reverse1: number;

  layer2: GroupValue;
  show2: boolean;
  start2: number;
  end2: number;
  color2: number;
  reverse2: number;

  layer3: GroupValue;
  show3: boolean;
  start3: number;
  end3: number;
  color3: number;
  reverse3: number;

  distortion: number;
}

interface Layer {
  enable: boolean;
  start: number;
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
    { ...Circle.nailsConfig, label: 'Circle number of nails' },
    Circle.rotationConfig,
    Circle.distortionConfig,
    {
      key: 'layers',
      label: 'Layers',
      type: 'group',
      // @ts-expect-error: dynamic key is safe because we know the keys match Layers
      children: LAYER_DEFAULTS.map(({ start, end, color, reverse }, i) => {
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
              key: `start${layer}`,
              label: 'Star position',
              defaultValue: start,
              type: 'range',
              attr: {
                min: 0,
                max: 0.5,
                step: ({ n }) => 1 / n,
              },
              displayValue: config =>
                Math.round(config.n * config[`start${layer}`]),
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

    const lineNailCount = Math.round(n / PI2);
    const circleConfig: CircleConfig = {
      size,
      n,
      margin,
      rotation: rotation - 0.25,
      distortion,
      getUniqueKey: k => lineNailCount + k,
    };

    const circle = new Circle(circleConfig);
    const lineSize = circle.radius;
    const lineSpacing = lineSize / lineNailCount;
    const firstCirclePoint = circle.getPoint(0);
    const totalNailCount = lineNailCount + n;
    const totalIndexCount = totalNailCount + lineNailCount;
    const layers = createArray(3, i => getLayer.call(this, i + 1)).filter(
      ({ enable }) => enable
    );

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
      const start =
        Math.round(n * this.config['start' + layerIndex]) + lineNailCount;

      let endIndex =
        Math.round(this.config['end' + layerIndex] * totalIndexCount) - start;

      // Making sure that we get to the last possible nail (due to fractions in the `step` property of the end control, that doesn't reach to 1)
      if (endIndex === totalIndexCount - start - 1) {
        endIndex++;
      }

      return {
        start,
        endIndex,
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

  #getCoordinatesForIndex(index: number): Coordinates {
    const exceeds = index - (this.calc.totalNailCount - 1);
    if (exceeds > 0) {
      return this.nails.getNailCoordinates(
        this.calc.lineNailCount - exceeds + 1
      );
    }

    return this.nails.getNailCoordinates(index % this.calc.totalNailCount);
  }

  *drawCircle(
    renderer: Renderer,
    { endIndex, color, isReverse, start }
  ): Generator<void> {
    let prevPointIndex: number;
    let isPrevSide = false;
    renderer.setColor(color);
    const self = this;
    const advance = isReverse ? -1 : 1;

    renderer.setStartingPoint(this.#getCoordinatesForIndex(getPointIndex(0)));

    for (let index = 0; index <= endIndex; index++) {
      if (index) {
        renderer.lineTo(this.#getCoordinatesForIndex(prevPointIndex + advance));
        yield;
      }
      prevPointIndex = getPointIndex(isPrevSide ? index : index + start);
      renderer.lineTo(this.#getCoordinatesForIndex(prevPointIndex));

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

  drawNails(nails: NailsSetter) {
    for (let i = 0; i < this.calc.lineNailCount; i++) {
      nails.addNail(i, this.getPoint(i));
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
