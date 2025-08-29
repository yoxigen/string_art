import StringArt from '../StringArt';
import Circle, { CircleConfig } from '../helpers/Circle';
import Color from '../helpers/color/Color';
import type { ControlsConfig } from '../types/config.types';
import { ColorConfig, ColorValue } from '../helpers/color/color.types';
import { Coordinates, Dimensions } from '../types/general.types';
import { withoutAttribute } from '../helpers/config_utils';
import { PI2 } from '../helpers/math_utils';
import { formatFractionAsPercent } from '../helpers/string_utils';

interface LotusConfig extends ColorConfig {
  sides: number;
  density: number;
  rotation: number;
  removeSections: number;
  fit: boolean;
  renderCenter: boolean;
  renderCenterNails: boolean;
  radialColor: boolean;
  centerRadius: number;
}

interface TCalc {
  circles: ReadonlyArray<Circle>;
  circleNailsCount: number;
  sideAngle: number;
  sections: number;
  nailsPerSection: number;
  nailsPerCircle: number;
  removedSections: number;
  centerCircle?: Circle;
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
      defaultValue: 16,
      attr: {
        min: 5,
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
        step: ({ sides, renderCenter }) =>
          1 / getSectionCountToRemove(sides, renderCenter),
      },
      defaultValue: 0,
      displayValue: ({ removeSections, sides, renderCenter }) =>
        Math.round(
          removeSections * getSectionCountToRemove(sides, renderCenter)
        ),
      isStructural: true,
    },
    {
      key: 'fit',
      label: 'Fit',
      type: 'checkbox',
      defaultValue: true,
      show: ({ removeSections }) => removeSections,
      isStructural: true,
    },
    {
      key: 'renderCenter',
      label: 'Render center',
      type: 'checkbox',
      defaultValue: true,
      isStructural: true,
    },
    {
      key: 'centerRadius',
      label: 'Center radius',
      type: 'range',
      defaultValue: 0,
      attr: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      displayValue: ({ centerRadius }) => formatFractionAsPercent(centerRadius),
      show: ({ renderCenter }) => renderCenter,
      isStructural: true,
    },
    {
      key: 'renderCenterNails',
      label: 'Render center nails',
      type: 'checkbox',
      defaultValue: false,
      isStructural: true,
      show: ({ renderCenter }) => renderCenter,
    },
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        multicolorStart: 20,
        multicolorRange: 26,
        multicolorByLightness: true,
        minLightness: 32,
        maxLightness: 85,
        saturation: 100,
        colorCount: 8,
      },
      customControls: [
        {
          key: 'radialColor',
          label: 'Radial color',
          defaultValue: false,
          type: 'checkbox',
        },
      ],
      maxColorCount: 32,
    }),
  ];

  defaultValues = {
    nailsColor: '#a08346',
  };

  #calc: TCalc;
  #color: Color;

  getCalc(): TCalc {
    const {
      sides,
      density,
      margin,
      rotation,
      removeSections,
      fit,
      centerRadius: centerRadiusPercent,
      renderCenter,
    } = this.config;
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
      const maxPetalSectionsToRemove = getSectionCountToRemove(
        sides,
        renderCenter
      );
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

    const calc: TCalc = {
      circles,
      circleNailsCount: baseCircleConfig.n,
      sideAngle,
      sections: getSectionsCount(sides),
      removedSections: petalSectionsToRemove,
      nailsPerSection: Math.floor(
        baseCircleConfig.n / (sides - 2 * petalSectionsToRemove)
      ),
      nailsPerCircle: baseCircleConfig.n,
    };

    if (renderCenter && centerRadiusPercent) {
      const lastSection = calc.sections - 1 - calc.removedSections;
      const maxCenterRadiusPoint = circles[0].getPoint(
        lastSection * calc.nailsPerSection
      );
      const maxCenterRadius = Math.floor(
        Math.sqrt(
          Math.abs(helperCircle.center[0] - maxCenterRadiusPoint[0]) ** 2 +
            Math.abs(helperCircle.center[1] - maxCenterRadiusPoint[1]) ** 2
        )
      );
      const centerCircleRadius = centerRadiusPercent * maxCenterRadius;
      calc.centerCircle = new Circle({
        n: sides,
        center: helperCircle.center,
        size: [centerCircleRadius, centerCircleRadius],
        radius: centerCircleRadius,
        rotation: -Math.ceil((sides - 4) / 2) / 2 / sides,
      });
    }

    return calc;

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
    let colorCount = this.config.radialColor
      ? this.#calc.sections - this.#calc.removedSections - 1
      : this.config.colorCount;

    if (!this.config.renderCenter && this.config.radialColor) {
      colorCount--;
    }

    this.#color = new Color({
      ...this.config,
      colorCount,
    });
  }

  #getPatchColor(circleIndex: number, section: number): ColorValue {
    const { radialColor } = this.config;
    const { removedSections } = this.#calc;

    return this.#color.getColor(
      radialColor ? section - removedSections : circleIndex
    );
  }

  *#drawPatch(circleIndex: number, section: number): Generator<void> {
    const { sides } = this.config;
    const {
      circles,
      sections,
      nailsPerSection,
      nailsPerCircle,
      removedSections,
    } = this.#calc;

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
      for (let i = nailsPerCircle - nailsPerSection; i < nailsPerCircle; i++) {
        this.renderer.renderLines(circle.getPoint(i), connectPoint);
        yield;
      }
      for (let i = 0; i <= nailsPerSection; i++) {
        this.renderer.renderLines(circle.getPoint(i), connectPoint);
        yield;
      }
    } else {
      // For middle sections, connectPoint is `circleIndex - 1`, (sideAngle * section + 1). Connect circleIndex[section] and `circleIndex + section`[section]

      const isLastSection = section === sections - 2;
      const connectPoint: Coordinates =
        isLastSection && this.#calc.centerCircle
          ? this.#calc.centerCircle.getPoint(circleIndex)
          : prevCircle.getPoint(
              nailsPerSection * (section + 2 - removedSections) -
                (sides % 2 && section === sections - 2
                  ? nailsPerSection / 2
                  : 0)
            );
      const firstCircle = circles[(circleIndex + section) % sides];
      const firstCircleStart =
        nailsPerCircle -
        (section + 1 - removedSections) * nailsPerSection -
        (removedSections ? 1 : 0);

      for (let i = 0; i <= nailsPerSection; i++) {
        this.renderer.renderLines(
          firstCircle.getPoint(firstCircleStart + i),
          connectPoint
        );
        yield;
      }

      const startIndex = (section - removedSections) * nailsPerSection + 1;
      for (let i = startIndex; i < startIndex + nailsPerSection; i++) {
        this.renderer.renderLines(circle.getPoint(i), connectPoint);
        yield;
      }
    }
  }

  *generateStrings(): Generator<void> {
    for (const { side, section } of this.#generatePatches()) {
      yield* this.#drawPatch(side, section);
    }
  }

  *#generatePatches(): Generator<{ side: number; section: number }> {
    const { radialColor, sides, renderCenter } = this.config;
    const { sections, removedSections } = this.#calc;

    const lastSection = sections - (renderCenter ? 1 : 2);

    if (radialColor) {
      for (let section = removedSections; section < lastSection; section++) {
        for (let side = 0; side < sides; side++) {
          yield { side, section };
        }
      }
    } else {
      for (let side = 0; side < sides; side++) {
        for (let section = removedSections; section < lastSection; section++) {
          yield { side, section };
        }
      }
    }
  }

  drawNails() {
    const { renderCenter, renderCenterNails } = this.config;
    const { circles, circleNailsCount, centerCircle } = this.#calc;

    circles.forEach((circle, circleIndex) => {
      circle.drawNails(this.nails, {
        getNumber: i => `${circleIndex + 1}_${i}`,
        excludedNailRanges: renderCenterNails
          ? null
          : this.#getCenterExcludedNails(),
      });
    });

    if (renderCenter) {
      if (centerCircle) {
        centerCircle.drawNails(this.nails, { getNumber: i => `C_${i + 1}` });
      } else {
        this.nails.addNail({ point: this.center, number: 'C' });
      }
    }
  }

  #getCenterExcludedNails(): [[number, number]] {
    const { renderCenter } = this.config;
    const { sections, nailsPerSection, nailsPerCircle, removedSections } =
      this.#calc;

    const innerSectionNailsStart =
      (sections - 1 - removedSections - (renderCenter ? 0 : 1)) *
        nailsPerSection +
      1;
    const innerSectionNailsEnd = nailsPerCircle - innerSectionNailsStart;

    return [[innerSectionNailsStart, innerSectionNailsEnd]];
  }

  getStepCount() {
    const { nailsPerSection, sections, removedSections } = this.getCalc();
    const { sides } = this.config;

    const patchCount = 2 * nailsPerSection + 1;
    const sideStepCount = patchCount * (sections - removedSections - 1);

    return sides * sideStepCount;
  }

  static thumbnailConfig = {};
}

function getSectionsCount(sides: number): number {
  return sides % 2 ? Math.ceil(sides / 2) : sides / 2;
}

function getSectionCountToRemove(sides: number, renderCenter: boolean): number {
  return getSectionsCount(sides) - (renderCenter ? 2 : 3);
}
