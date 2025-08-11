import Color from '../helpers/color/Color';
import Circle from '../helpers/Circle';
import Mandala, { MandalaConfig } from './Mandala';
import { ControlsConfig } from '../types/config.types';
import { formatFractionAsPercent } from '../helpers/string_utils';

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
    },
    {
      ...Circle.rotationConfig,
      defaultValue: 176 / 360,
    },
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
    },
    {
      key: 'reverse',
      label: 'Reverse',
      defaultValue: true,
      type: 'checkbox',
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
  };

  setUpDraw() {
    super.setUpDraw();
    const { n, layerSpread } = this.config;
    this.calc.layerShift = Math.round(n * layerSpread);
  }

  *generateStrings() {
    const { layers } = this.config;

    for (let layer = 0; layer < layers; layer++) {
      yield* this.drawTimesTable(layer);
    }
  }

  static thumbnailConfig = {
    n: 70,
  };
}
