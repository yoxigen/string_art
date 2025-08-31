import Color from '../helpers/color/Color';
import StringArt from '../StringArt';
import Circle, { CircleConfig } from '../helpers/Circle';
import { ColorConfig } from '../helpers/color/color.types';
import { ControlsConfig, PrimitiveValue } from '../types/config.types.js';

export interface MandalaConfig extends ColorConfig {
  n: number;
  base: number;
  layers: number;
  rotation: number;
  distortion: number;
  layerFill?: number;
  reverse?: boolean;
}

interface TCalc {
  n: number;
  stringsPerLayer: number;
  layerShift: number;
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

  circle: Circle;
  color: Color;
  calc: TCalc;

  get n() {
    return this.calc.n;
  }

  getCalc(): TCalc {
    const { n: nConfig, layers, layerFill } = this.config;
    const extraNails = nConfig % layers;
    const n = nConfig - extraNails; // The number of nails should be a multiple of the layers, so the strings are exactly on the nails.

    return {
      n,
      stringsPerLayer: layerFill ? Math.floor(n * layerFill) : n,
      layerShift: Math.floor(n / layers),
    };
  }

  setUpDraw() {
    super.setUpDraw();

    const { layers, rotation, distortion, margin, layerFill, base, reverse } =
      this.config;
    this.calc = this.getCalc();

    const circleConfig: CircleConfig = {
      size: this.size,
      n: this.n,
      margin,
      rotation,
      distortion,
      reverse,
    };

    if (this.circle) {
      this.circle.setConfig(circleConfig);
    } else {
      this.circle = new Circle(circleConfig);
    }

    this.color = new Color({
      ...this.config,
      colorCount: layers,
    });
  }

  *drawTimesTable(layerIndex: number): Generator<void> {
    const { reverse, base } = this.config;
    const { n, layerShift, stringsPerLayer } = this.calc;

    const shift = layerShift * layerIndex * (reverse ? 1 : -1);
    const color = this.color.getColor(layerIndex);
    this.renderer.setColor(color);

    let point = this.circle.getPoint(shift);

    for (let i = 1; i <= stringsPerLayer; i++) {
      const startPoint = point;
      point = this.circle.getPoint(i + shift);
      const toIndex = (i * base) % n;
      this.renderer.renderLines(
        startPoint,
        point,
        this.circle.getPoint(toIndex + shift)
      );

      yield;
    }
  }

  *generateStrings(): Generator<void> {
    const { layers } = this.config;

    for (let layer = 0; layer < layers; layer++) {
      yield* this.drawTimesTable(layer);
    }
  }

  drawNails() {
    this.circle.drawNails(this.nails);
  }

  getStepCount(): number {
    const { layers, layerFill } = this.config;
    const { n } = this.getCalc();
    const stringsPerLayer = layerFill ? Math.floor(n * layerFill) : n;
    return (layers ?? 1) * stringsPerLayer;
  }

  static thumbnailConfig = {
    n: 70,
  };
}
