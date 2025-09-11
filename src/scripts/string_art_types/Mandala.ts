import Color from '../helpers/color/Color';
import StringArt from '../StringArt';
import Circle, { CircleConfig } from '../helpers/Circle';
import { ColorConfig } from '../helpers/color/color.types';
import { ControlsConfig } from '../types/config.types';
import Renderer from '../renderers/Renderer';
import { CalcOptions } from '../types/stringart.types';

export interface MandalaConfig extends ColorConfig {
  n: number;
  base: number;
  layers: number;
  rotation: number;
  distortion: number;
  layerFill?: number;
  reverse?: boolean;
}

export interface MandalaCalc {
  n: number;
  stringsPerLayer: number;
  layerShift: number;
  circle: Circle;
}

export default class Mandala<TCustomConfig = void> extends StringArt<
  MandalaConfig & TCustomConfig
> {
  static type = 'mandala';

  name = 'Mandala';
  id = 'mandala';
  link = 'https://www.youtube.com/watch?v=qhbuKbxJsk8';
  linkText = 'Learn';
  controls: ControlsConfig<MandalaConfig & TCustomConfig> = [
    {
      key: 'n',
      label: 'Number of nails',
      defaultValue: 180,
      type: 'range',
      attr: { min: 3, max: 240, step: 1 },
      isStructural: true,
    },
    {
      key: 'base',
      label: 'Multiplication',
      defaultValue: 2,
      type: 'range',
      attr: { min: 2, max: 99, step: 1 },
      affectsNails: false,
    },
    {
      key: 'layers',
      label: 'Layers',
      defaultValue: 7,
      type: 'range',
      attr: { min: 1, max: 20, step: 1 },
      isStructural: true,
    },
    Circle.rotationConfig,
    Circle.distortionConfig,
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        multicolorRange: 165,
        multicolorStart: 256,
        color: '#ff4d00',
      },
      exclude: ['colorCount'],
    }),
  ];

  color: Color;
  calc: MandalaCalc;

  get n() {
    return this.calc.n;
  }

  resetStructure(): void {
    this.calc = null;
  }

  getCalc({ size }: CalcOptions): MandalaCalc {
    const {
      n: nConfig,
      layers,
      layerFill,
      rotation,
      distortion,
      margin,
      reverse,
    } = this.config;
    const extraNails = nConfig % layers;
    const n = nConfig - extraNails; // The number of nails should be a multiple of the layers, so the strings are exactly on the nails.

    const circleConfig: CircleConfig = {
      size,
      n,
      margin,
      rotation,
      distortion,
      reverse,
    };

    return {
      n,
      stringsPerLayer: layerFill ? Math.floor(n * layerFill) : n,
      layerShift: Math.floor(n / layers),
      circle: new Circle(circleConfig),
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw();

    const { layers, rotation, distortion, margin, reverse } = this.config;
    if (!this.calc) {
      this.calc = this.getCalc(options);
    }

    const circleConfig: CircleConfig = {
      size: this.size,
      n: this.n,
      margin,
      rotation,
      distortion,
      reverse,
    };

    this.color = new Color({
      ...this.config,
      colorCount: layers,
    });
  }

  getAspectRatio(options: CalcOptions): number {
    const calc = this.getCalc(options);
    return calc.circle.aspectRatio;
  }

  *drawTimesTable(renderer: Renderer, layerIndex: number): Generator<void> {
    const { reverse, base } = this.config;
    const { n, layerShift, stringsPerLayer } = this.calc;

    const shift = layerShift * layerIndex * (reverse ? 1 : -1);
    const color = this.color.getColor(layerIndex);
    renderer.setColor(color);

    let point = this.calc.circle.getPoint(shift);

    for (let i = 1; i <= stringsPerLayer; i++) {
      const startPoint = point;
      point = this.calc.circle.getPoint(i + shift);
      const toIndex = (i * base) % n;
      renderer.renderLines(
        startPoint,
        point,
        this.calc.circle.getPoint(toIndex + shift)
      );

      yield;
    }
  }

  *drawStrings(renderer: Renderer): Generator<void> {
    const { layers } = this.config;

    for (let layer = 0; layer < layers; layer++) {
      yield* this.drawTimesTable(renderer, layer);
    }
  }

  drawNails() {
    this.calc.circle.drawNails(this.nails);
  }

  getStepCount(options: CalcOptions): number {
    const { layers, layerFill } = this.config;
    const { n } = this.getCalc(options);
    const stringsPerLayer = layerFill ? Math.floor(n * layerFill) : n;
    return (layers ?? 1) * stringsPerLayer;
  }
  // @ts-ignore
  thumbnailConfig = ({ n }) => ({
    n: Math.min(n, 70),
  });
}
