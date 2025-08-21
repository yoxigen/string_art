import StringArt from '../StringArt';
import Circle, { CircleConfig } from '../helpers/Circle';
import Color from '../helpers/color/Color';
import { formatFractionAsPercent } from '../helpers/string_utils';
import type { ControlsConfig } from '../types/config.types';
import { ColorConfig } from '../helpers/color/color.types';
import { Dimensions } from '../types/general.types';

interface LotusConfig extends ColorConfig {
  sides: number;
  density: number;
  d: number;
}

interface TCalc {}

export default class Lotus extends StringArt<LotusConfig> {
  static type = 'lotus';

  name = 'Lotus';
  id = 'lotus';
  controls: ControlsConfig<LotusConfig> = [
    {
      key: 'sides',
      label: 'Sides',
      description: 'How many petals there are in the Lotus',
      type: 'range',
      defaultValue: 12,
      attr: {
        min: 3,
        max: 64,
        step: 1,
      },
      isStructural: true,
    },
    {
      key: 'density',
      label: 'Density',
      type: 'range',
      defaultValue: 144,
      attr: {
        min: 1,
        max: 500,
        step: 1,
      },
      isStructural: true,
    },
    {
      key: 'd',
      label: 'Distance',
      description:
        'The distance of the center of the circles that form the lotus from the center of the lotus',
      type: 'range',
      attr: {
        min: 0.1,
        max: 2,
        step: 0.01,
      },
      defaultValue: 0.5,
      displayValue: ({ d }) => formatFractionAsPercent(d),
      isStructural: true,
    },
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
    }),
  ];

  #calc: TCalc;
  #color: Color;

  getCalc(): TCalc {
    return {};
  }

  resetStructure() {
    super.resetStructure();

    this.#calc = null;
  }

  setUpDraw() {
    super.setUpDraw();

    const { margin = 0 } = this.config;
    const center = this.size.map(v => v / 2);
    const radius = Math.min(...center) - margin;

    if (!this.#calc) {
      this.#calc = this.getCalc();
    }

    this.#color = new Color(this.config);
  }

  *generateStrings() {}

  drawNails() {
    const { sides, density, d, margin } = this.config;

    const radius = (Math.min(...this.size) * d) / 2;

    // Draw circles around the center point. For this, create a helper Circle, so its points can be used as centers for the lotus circles:
    const helperCircle = new Circle({
      n: sides,
      size: this.size.map(v => v * d - margin) as Dimensions,
      center: this.center,
      radius: radius - margin / 2,
      rotation: 0,
    });

    const circleNails = density - (density % sides);

    for (let i = 0; i < sides; i++) {
      const sideCircle = new Circle({
        n: circleNails,
        size: [radius - margin / 2, radius - margin / 2],
        center: helperCircle.getPoint(i),
        radius: radius - margin / 2,
        rotation: 0,
      });

      sideCircle.drawNails(this.nails);
    }
  }

  getStepCount() {
    return 100;
  }

  static thumbnailConfig = {};
}
