import Color from '../helpers/Color.js';
import Circle from '../helpers/Circle.js';
import Spiral from './Spiral.js';

export default class Wave extends Spiral {
  id = 'wave';
  name = 'Wave';
  link =
    'https://www.etsy.com/il-en/listing/943140543/personalized-gift-string-art-mandala?ref=sim_rv-5&pro=1';
  controls = [
    {
      ...Circle.nailsConfig,
      defaultValue: 144,
    },
    {
      key: 'repetition',
      label: 'Repetition',
      defaultValue: 2,
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
      defaultValue: 176 / 360,
    },
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
      defaultValue: 0.075,
      type: 'range',
      attr: {
        min: 0,
        max: 1,
        step: ({ config: { n } }) => 1 / n,
      },
      displayValue: ({ layerSpread, n }) => Math.round(layerSpread * n),
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
  }

  *generateStrings() {
    for (let layer = 0; layer < this.layersCount; layer++) {
      yield* this.drawSpiral({
        color: this.color.getColor(layer),
        shift: -this.layerShift * layer,
      });
    }
  }

  static thumbnailConfig = {
    n: 40,
  };
}
