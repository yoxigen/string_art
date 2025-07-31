import StringArt from '../StringArt.js';
import Color from '../helpers/Color.js';
import StarShape from '../helpers/StarShape.js';
import { insertAfter } from '../helpers/config_utils.js';

export default class Sun extends StringArt {
  name = 'Sun';
  id = 'sun';
  controls = insertAfter(
    [
      ...StarShape.StarConfig,
      Color.getConfig({
        defaults: {
          isMultiColor: true,
          multicolorRange: 1,
          multicolorStart: 237,
          color: '#ffffff',
          saturation: 40,
          multicolorByLightness: true,
          minLightness: 20,
          maxLightness: 97,
        },
        exclude: ['colorCount'],
      }),
    ],
    'sides',
    [
      {
        key: 'layers',
        label: 'Layers',
        defaultValue: 4,
        type: 'range',
        attr: {
          min: 1,
          max: 20,
          step: 1,
        },
        isStructural: true,
      },
      {
        key: 'layerSpread',
        label: 'Layer spread',
        defaultValue: 0.1625,
        type: 'range',
        displayValue: ({ layerSpread, sideNails }) =>
          Math.ceil(sideNails * layerSpread),
        attr: {
          min: ({ config: { sideNails, layers } }) => 1 / (layers * sideNails),
          max: ({ config: { layers } }) => 1 / (layers - 1) - 0.02,
          step: ({ config: { sideNails, layers } }) => 1 / (layers * sideNails),
        },
        isStructural: true,
      },
    ]
  );

  defaultValues = {
    sides: 8,
    layers: 4,
    layerSpread: 0.1625,
    color: '#ffffff',
    saturation: 40,
    multicolorByLightness: true,
    minLightness: 20,
    maxLightness: 97,
  };

  #star = null;

  setUpDraw() {
    super.setUpDraw();

    const { margin = 0, layers } = this.config;
    const center = this.size.map(v => v / 2);
    const radius = Math.min(...center) - margin;

    const starConfig = {
      ...this.config,
      radius,
      size: this.size,
    };

    if (this.#star) {
      this.#star.setConfig(starConfig);
    } else {
      this.#star = new StarShape(starConfig);
    }

    this.color = new Color({
      ...this.config,
      colorCount: layers,
    });
  }

  *drawStar(size) {
    yield* this.#star.generateStrings(this.renderer, { size });
  }

  *generateLayers() {
    const { sideNails, layerSpread, layers } = this.config;

    for (let layer = 0; layer < layers; layer++) {
      const color = this.color.getColor(layer);
      this.renderer.setColor(color);

      const layerSize = Math.floor(sideNails * (1 - layerSpread * layer));
      yield* this.drawStar(layerSize);
    }
  }

  *generateStrings() {
    yield* this.generateLayers();
  }

  drawNails() {
    this.#star.drawNails(this.nails);
  }

  getStepCount() {
    const { layers, layerSpread, sideNails } = this.config;

    let stepCount = 0;
    for (let layer = 0; layer < layers; layer++) {
      const layerSize = Math.floor(sideNails * (1 - layerSpread * layer));
      stepCount += StarShape.getStepCount(this.config, { size: layerSize });
    }

    return stepCount;
  }

  static thumbnailConfig = {
    sideNails: 18,
  };
}
