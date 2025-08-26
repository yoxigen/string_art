import StringArt from '../StringArt';
import Circle, { CircleConfig } from '../helpers/Circle';
import Color from '../helpers/color/Color';
import type { ControlsConfig } from '../types/config.types';
import { ColorConfig, ColorValue } from '../helpers/color/color.types';
import { Coordinates, Dimensions } from '../types/general.types';
import { withoutAttribute } from '../helpers/config_utils';
import { PI2 } from '../helpers/math_utils';

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
  sections: number;
  nailsPerSection: number;
  nailsPerCircle: number;
  removedSections: number;
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
        min: 4,
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
      show: ({ removeSections }) => removeSections,
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
    const size = this.getSize();
    let radius = (Math.min(...size) * d) / 2;

    const sideAngle = PI2 / sides;
    const densityNailCount = fixNailsCount(density);
    const baseCircleConfig: CircleConfig = {
      n: densityNailCount,
      center: [0, 0],
      size: [0, 0],
      radius: 0,
      rotation: 0,
    };

    let petalSectionsToRemove = 0;

    if (removeSections) {
      const maxPetalSectionsToRemove = getSectionCountToRemove(sides);
      petalSectionsToRemove = Math.min(
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
      size: size.map(v => v * d - margin) as Dimensions,
      center: this.center,
      radius: radius - margin / 2,
      rotation,
    });

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
      sections: getSectionsCount(sides) - petalSectionsToRemove,
      removedSections: petalSectionsToRemove,
      nailsPerSection: baseCircleConfig.n / sides,
      nailsPerCircle: baseCircleConfig.n,
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
    console.log('CALC', this.#calc);
    this.#color = new Color(this.config);
  }

  #getPatchColor(circleIndex: number, section: number): ColorValue {
    return this.#color.getColor(circleIndex);
  }

  *#drawPatch(circleIndex: number, section: number): Generator<void> {
    const { sides } = this.config;
    const { circles, sections, nailsPerSection, nailsPerCircle } = this.#calc;

    const color = this.#getPatchColor(circleIndex, section);
    const circle = circles[circleIndex];

    this.renderer.setColor(color);

    const prevCircle =
      this.#calc.circles[circleIndex === 0 ? sides - 1 : circleIndex - 1];

    if (section === 0) {
      // For first section (outtermost): connectPoint is `prevCircle[sideAngle * 2]
      const connectPoint: Coordinates = prevCircle.getPoint(
        nailsPerSection * 2
      );
      for (let i = nailsPerCircle - nailsPerSection; i <= nailsPerCircle; i++) {
        this.renderer.renderLines(circle.getPoint(i), connectPoint);
        yield;
      }
      for (let i = 0; i <= nailsPerSection; i++) {
        this.renderer.renderLines(circle.getPoint(i), connectPoint);
        yield;
      }
    } else if (section < this.#calc.sections - 1) {
      // For middle sections, connectPoint is `circleIndex - 1`, (sideAngle * section + 1). Connect circleIndex[section] and `circleIndex + section`[section]
      const connectPoint: Coordinates = prevCircle.getPoint(
        nailsPerSection * (section + 2)
      );
      const firstCircle = circles[(circleIndex + section) % sides];
      const firstCircleStart = nailsPerCircle - (section + 1) * nailsPerSection;

      for (let i = 0; i <= nailsPerSection; i++) {
        this.renderer.renderLines(
          firstCircle.getPoint(firstCircleStart + i),
          connectPoint
        );
        yield;
      }

      const startIndex = section * nailsPerSection + 1;
      for (let i = startIndex; i < startIndex + nailsPerSection; i++) {
        this.renderer.renderLines(circle.getPoint(i), connectPoint);
        yield;
      }
    } else {
      // If section is max (innermost), strings are between the circleIndex and the last connecting circle, both to the center point of the pattern
    }
  }

  *generateStrings(): Generator<void> {
    const { sections, removedSections } = this.#calc;
    const { sides } = this.config;

    for (let side = 0; side < sides; side++) {
      for (let section = removedSections; section < sections; section++) {
        yield* this.#drawPatch(side, section);
      }
    }
  }

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
    const { nailsPerSection, sections } = this.getCalc();
    const { sides } = this.config;

    return (sides + 1) * (sections - 1) * nailsPerSection * 2;
  }

  static thumbnailConfig = {};
}

function getSectionsCount(sides: number): number {
  return sides % 2 ? Math.ceil(sides / 2) : sides / 2;
}

function getSectionCountToRemove(sides: number): number {
  return getSectionsCount(sides) - 1;
}
