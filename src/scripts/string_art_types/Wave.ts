import Color from '../helpers/color/Color.js';
import Circle from '../helpers/Circle.js';
import Mandala from './Mandala.js';

export default class Wave extends Mandala {
  id = 'wave';
  name = 'Wave';
  link =
    'https://www.etsy.com/il-en/listing/943140543/personalized-gift-string-art-mandala?ref=sim_rv-5&pro=1';
  controls = [
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
      displayValue: ({ layerFill }) => Math.floor(100 * layerFill) + '%',
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
        multicolorRange: 216,
        multicolorStart: 263,
        color: '#ffffff',
        multicolorByLightness: true,
        minLightness: 10,
        maxLightness: 90,
      },
      exclude: ['colorCount'],
    }),
  ];

  setUpDraw() {
    super.setUpDraw();
    const { n, layerSpread } = this.config;
    this.layerShift = Math.round(n * layerSpread);
    this.base = 2;
  }

  *generateStrings() {
    const { layers, reverse } = this.config;

    for (let layer = 0; layer < layers; layer++) {
      yield* this.drawTimesTable({
        color: this.color.getColor(layer),
        shift: this.layerShift * (reverse ? 1 : -1) * layer,
        time: layer,
      });
    }
  }

  static thumbnailConfig = {
    n: 70,
  };
}
