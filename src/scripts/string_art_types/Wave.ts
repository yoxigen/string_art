import Color from '../helpers/color/Color';
import Circle from '../shapes/Circle';
import Mandala, { MandalaCalc, MandalaConfig } from './Mandala';
import { ControlsConfig } from '../types/config.types';
import { formatFractionAsPercent } from '../helpers/string_utils';
import { withoutAttribute } from '../helpers/config_utils';
import Renderer from '../infra/renderers/Renderer';
import { CalcOptions } from '../types/stringart.types';

export interface WaveConfig {
  layerSpread: number;
}

export default class Wave extends Mandala<WaveConfig> {
  static type = 'wave';

  id = 'wave';
  name = 'Wave';
  link =
    'https://www.etsy.com/il-en/listing/943140543/personalized-gift-string-art-mandala?ref=sim_rv-5&pro=1';
  controls: ControlsConfig<MandalaConfig & WaveConfig> = [
    {
      ...Circle.nailsConfig,
      defaultValue: 200,
    },
    {
      key: 'layerFill',
      label: 'Layer fill',
      defaultValue: 0.5,
      type: 'range',
      attr: {
        min: ({ n }) => 1 / n,
        max: 1,
        step: ({ n }) => 1 / n,
      },
      displayValue: ({ layerFill }) => formatFractionAsPercent(layerFill),
      affectsNails: false,
      isStructural: true,
    },
    withoutAttribute(Circle.rotationConfig, 'snap'),
    Circle.distortionConfig,
    {
      key: 'layers',
      label: 'Layers',
      defaultValue: 11,
      type: 'range',
      attr: { min: 1, max: 20, step: 1 },
    },
    {
      key: 'layerSpread',
      label: 'Layer spread',
      defaultValue: 15 / 200,
      type: 'range',
      attr: {
        min: 0,
        max: 1,
        step: ({ n }) => 1 / n,
      },
      displayValue: ({ layerSpread, n }) => Math.round(layerSpread * n),
      affectsNails: false,
      isStructural: true,
    },
    {
      key: 'reverse',
      label: 'Reverse',
      defaultValue: true,
      type: 'checkbox',
      isStructural: true,
    },
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        multicolorRange: 196,
        multicolorStart: 273,
        color: '#ffffff',
        multicolorByLightness: true,
        minLightness: 10,
        maxLightness: 90,
      },
      exclude: ['colorCount'],
    }),
  ];

  defaultValues = {
    base: 2,
    rotation: 176 / 360,
  };

  getCalc(options: CalcOptions): MandalaCalc {
    const { n, layerSpread } = this.config;

    return {
      ...super.getCalc(options),
      layerShift: Math.round(n * layerSpread),
    };
  }

  *drawStrings(renderer: Renderer) {
    const { layers } = this.config;

    for (let layer = 0; layer < layers; layer++) {
      yield* this.drawMultiplicationLayer(renderer, layer);
    }
  }
}
