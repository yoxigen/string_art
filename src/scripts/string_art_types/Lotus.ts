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
  removeSections: number;
  fit: boolean;
}

interface TCalc {
  circles: ReadonlyArray<Circle>;
  circleNailsCount: number;
  sideAngle: number;
}

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
        step: ({ sides }) => sides,
      },
      isStructural: true,
    },
    withoutAttribute(Circle.rotationConfig, 'snap'),
    {
      key: 'removeSections',
      label: 'Remove sections',
      type: 'range',
      attr: {
        min: 0,
        max: 1,
        step: ({ sides }) => 1 / getSectionCountToRemove(sides),
      },
      defaultValue: 0,
      displayValue: ({ removeSections, sides }) =>
        Math.round(removeSections * getSectionCountToRemove(sides)),
      isStructural: true,
    },
    {
      key: 'fit',
      label: 'Fit',
      type: 'checkbox',
      defaultValue: true,
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
    const { sides, density, margin, rotation, removeSections, fit } =
      this.config;
    const d = 0.5; // The helper circle's center is right between the pattern center and the edge
    let radius = (Math.min(...this.size) * d) / 2;

    const sideAngle = PI2 / sides;
    const densityNailCount = fixNailsCount(density);
    const baseCircleConfig: CircleConfig = {
      n: densityNailCount,
      center: [0, 0],
      size: [0, 0],
      radius: 0,
      rotation: 0,
    };

    if (removeSections) {
      const maxPetalSectionsToRemove = getSectionCountToRemove(sides);
      const petalSectionsToRemove = Math.min(
        maxPetalSectionsToRemove,
        Math.round(removeSections * maxPetalSectionsToRemove)
      );

      const angleStart = sideAngle * petalSectionsToRemove;

      if (fit) {
        // Since we removed sections and now the pattern is smaller than the canvas size, we fit the remaining shape to fit on canvas
        // this is done by:
        // 1. Calculating the new outer edge of the shape, after removing sections
        // 2. Increase the size of the circles that create petals by the inverse ratio of the new to original size
        // 3. Since the circles are now larger, increase the number of nails in the circles by the size ratio, to maintain density.
        const topSectionHeight =
          2 * radius * Math.sin((Math.PI - angleStart) / 2);
        const fitAspectRatio = (2 * radius - margin) / topSectionHeight;
        baseCircleConfig.n = removeSectionsNailCount(
          fixNailsCount(density * fitAspectRatio),
          petalSectionsToRemove
        );
        radius *= fitAspectRatio;
      } else {
        // the `density` config is for a full circle, so making the number of nails on a petal relative to the size of the petal arc relative to a full circle
        baseCircleConfig.n = removeSectionsNailCount(
          densityNailCount,
          petalSectionsToRemove
        );
      }

      Object.assign(baseCircleConfig, {
        angleStart,
        angleEnd: PI2 - angleStart,
      });
    }

    Object.assign(baseCircleConfig, {
      size: [radius - margin / 2, radius - margin / 2],
      radius: radius - margin / 2,
    });

    // Draw circles around the center point. For this, create a helper Circle, so its points can be used as centers for the lotus circles:
    const helperCircle = new Circle({
      n: sides,
      size: this.size.map(v => v * d - margin) as Dimensions,
      center: this.center,
      radius: radius - margin / 2,
      rotation,
    });

    baseCircleConfig.n = Math.floor(baseCircleConfig.n);

    const circles = new Array(sides).fill(null).map(
      (_, i) =>
        new Circle({
          ...baseCircleConfig,
          center: helperCircle.getPoint(i),
          rotation: rotation - i / sides,
        })
    );

    return {
      circles,
      circleNailsCount: baseCircleConfig.n,
      sideAngle,
    };

    function fixNailsCount(nailsCount: number): number {
      return Math.max(sides, nailsCount - (nailsCount % sides));
    }

    function removeSectionsNailCount(
      fullCircleNailCount: number,
      sectionsToRemove: number
    ): number {
      return Math.round(
        fullCircleNailCount * (1 - (2 * sectionsToRemove) / sides) + 1
      );
    }
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
    const { circles, circleNailsCount } = this.getCalc();

    circles.forEach((circle, i) => {
      circle.drawNails(this.nails, {
        nailsNumberStart: i * circleNailsCount,
      });
    });
    // circles[0].drawNails(this.nails);
  }

  getStepCount() {
    return 100;
  }

  static thumbnailConfig = {};
}

function getSectionCountToRemove(sides: number): number {
  return sides % 2 ? Math.floor(sides / 2) : sides / 2 - 1;
}
