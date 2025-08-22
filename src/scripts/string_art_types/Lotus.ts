import StringArt from '../StringArt';
import Circle, { CircleConfig } from '../helpers/Circle';
import Color from '../helpers/color/Color';
import type { ControlsConfig } from '../types/config.types';
import { ColorConfig } from '../helpers/color/color.types';
import { Dimensions } from '../types/general.types';
import { withoutAttribute } from '../helpers/config_utils';
import { PI2 } from '../helpers/math_utils';
import { formatFractionAsPercent } from '../helpers/string_utils';

interface LotusConfig extends ColorConfig {
  sides: number;
  density: number;
  rotation: number;
  isPetals: boolean;
  removePetals: number;
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
    withoutAttribute(Circle.rotationConfig, 'snap'),
    {
      key: 'isPetals',
      label: 'Is petals',
      type: 'checkbox',
      defaultValue: false,
      isStructural: true,
    },
    {
      key: 'removePetals',
      label: 'Remove petals',
      type: 'range',
      attr: {
        min: 0,
        max: 1,
        step: ({ sides }) => 1 / (Math.floor(sides / 2) - 2),
      },
      defaultValue: 0,
      displayValue: ({ removePetals }) => formatFractionAsPercent(removePetals),
      isStructural: true,
      show: ({ isPetals }) => isPetals,
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

    if (!this.#calc) {
      this.#calc = this.getCalc();
    }

    this.#color = new Color(this.config);
  }

  *generateStrings() {}

  drawNails() {
    const { sides, density, margin, rotation, isPetals, removePetals } =
      this.config;
    const d = 0.5; // The helper circle's center is right between the pattern center and the edge
    const radius = (Math.min(...this.size) * d) / 2;

    // Draw circles around the center point. For this, create a helper Circle, so its points can be used as centers for the lotus circles:
    const helperCircle = new Circle({
      n: sides,
      size: this.size.map(v => v * d - margin) as Dimensions,
      center: this.center,
      radius: radius - margin / 2,
      rotation,
    });

    const circleNails = density - (density % sides);
    const sideAngle = PI2 / sides;

    const baseCircleConfig: CircleConfig = {
      n: circleNails,
      size: [radius - margin / 2, radius - margin / 2],
      radius: radius - margin / 2,
      center: [0, 0],
      rotation: 0,
    };

    if (isPetals) {
      const petalSectionCount = Math.floor(sides / 2) - 1;
      const angleStart =
        sideAngle *
        Math.min(
          petalSectionCount,
          1 + Math.floor(removePetals * petalSectionCount)
        );
      const petalDensity = (density * (PI2 - 2 * angleStart)) / PI2;

      Object.assign(baseCircleConfig, {
        angleStart,
        angleEnd: PI2 - angleStart,
        n: petalDensity - (petalDensity % sides), // the `density` config is for a full circle, so making the number of nails on a petal relative to the size of the petal arc relative to a full circle
      });
    }

    for (let i = 0; i < sides; i++) {
      const circleConfig: CircleConfig = {
        ...baseCircleConfig,
        center: helperCircle.getPoint(i),
        rotation: rotation - i / sides,
      };

      const sideCircle = new Circle(circleConfig);

      sideCircle.drawNails(this.nails, { nailsNumberStart: i * circleNails });
    }
  }

  getStepCount() {
    return 100;
  }

  static thumbnailConfig = {};
}
