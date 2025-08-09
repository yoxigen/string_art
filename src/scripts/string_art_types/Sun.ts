import StringArt from '../StringArt';
import Circle, { CircleConfig } from '../helpers/Circle';
import Color from '../helpers/color/Color';
import StarShape, { StarShapeConfig } from '../helpers/StarShape';
import { insertAfter } from '../helpers/config_utils';
import { mapKeys } from '../helpers/object_utils';
import { formatFractionAsPercent } from '../helpers/string_utils';
import type { ControlsConfig, GroupValue } from '../types/config.types';
import { ColorConfig, ColorValue } from '../helpers/color/color.types';
import { Coordinates } from '../types/general.types';

interface SunConfig extends StarShapeConfig, ColorConfig {
  layers: number;
  layerSpread: number;
  starRadius: number;
  backdrop: GroupValue;
  backdropColorCount: number;
  backdropNailsRadius: number;
  backdropSize: number;
  backdropRadius: number;
  backdropShift: number;
  backdropSkip: boolean;
  backdropNailsColor: ColorValue;
  backdropIsMultiColor: boolean;
  starGroup: GroupValue;
}

interface TCalc {
  backdropNails: number;
}

export default class Sun extends StringArt<SunConfig> {
  name = 'Sun';
  id = 'sun';
  controls: ControlsConfig<SunConfig> = [
    {
      key: 'starGroup',
      label: 'Star',
      type: 'group',
      children: [
        ...insertAfter<SunConfig>(
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
              displayValue: ({ layerSpread }) =>
                formatFractionAsPercent(layerSpread),
              attr: {
                min: 0.01,
                max: 1,
                step: 0.02,
              },
              show: ({ layers }) => layers !== 1,
              isStructural: true,
            },
            {
              key: 'starRadius',
              label: 'Star Radius',
              defaultValue: 1,
              type: 'range',
              displayValue: ({ starRadius }) =>
                formatFractionAsPercent(starRadius),
              attr: {
                min: 0.2,
                max: 1,
                step: 0.01,
              },
              isStructural: true,
              affectsStepCount: false,
            },
          ]
        ),
      ],
    },
    {
      key: 'backdrop',
      label: 'Backdrop',
      type: 'group',
      children: [
        {
          key: 'backdropSize',
          label: 'Backdrop size',
          defaultValue: 0.5,
          type: 'range',
          displayValue: ({ backdropSize }) =>
            formatFractionAsPercent(backdropSize),
          attr: {
            min: 0,
            max: 1,
            step: ({ sideNails }) => 1 / sideNails,
          },
          isStructural: true,
        },
        {
          key: 'backdropRadius',
          label: 'Backdrop radius',
          defaultValue: 1,
          type: 'range',
          displayValue: ({ backdropRadius }) =>
            formatFractionAsPercent(backdropRadius),
          attr: {
            min: 0,
            max: 1,
            step: 0.01,
          },
          isStructural: true,
          affectsStepCount: false,
        },
        {
          key: 'backdropShift',
          label: 'Backdrop shift',
          defaultValue: 0,
          type: 'range',
          displayValue: ({ backdropShift }) =>
            formatFractionAsPercent(backdropShift),
          attr: {
            min: 0,
            max: 1,
            step: ({ sideNails, backdropSize }) =>
              (1 / (sideNails * (1 - backdropSize))).toFixed(3),
          },
          isStructural: true,
          affectsStepCount: false,
        },
        {
          key: 'backdropSkip',
          label: 'Backdrop skip',
          description:
            "If yes, connections in the backdrop are from the backdrop's nail to the second-nearest side, not the ones near it",
          defaultValue: false,
          type: 'checkbox',
          isStructural: true,
          affectsStepCount: false,
          show: ({ sides }) => sides > 3,
        },
        Color.getConfig<SunConfig>({
          defaults: {
            isMultiColor: true,
            multicolorRange: 20,
            multicolorStart: 0,
            color: '#ffffff',
            saturation: 57,
            multicolorByLightness: true,
            minLightness: 20,
            maxLightness: 40,
          },
          propMapper: ({ key, show }) => {
            const newKey = 'backdrop' + key[0].toUpperCase() + key.slice(1);
            return {
              key: 'backdrop' + key[0].toUpperCase() + key.slice(1),
              show: show
                ? ({ backdropIsMultiColor }) =>
                    key === 'color'
                      ? !backdropIsMultiColor
                      : backdropIsMultiColor
                : null,
            };
          },
          groupLabel: 'Backdrop color',
          maxColorCount: 2,
        }),
      ],
    },
  ];

  getCommonControls(): ControlsConfig<Partial<SunConfig>> {
    return insertAfter<Partial<SunConfig>>(
      super.getCommonControls(),
      'nailsColor',
      [
        {
          key: 'backdropNailsColor',
          label: 'Backdrop nails color',
          type: 'color',
          defaultValue: '#ffffff',
          show: ({ showNails }) => showNails,
        },
        {
          key: 'backdropNailsRadius',
          label: 'Backdrop nails radius',
          type: 'range',
          defaultValue: 1.5,
          attr: { min: 0.5, max: 5, step: 0.25 },
          show: ({ showNails }) => showNails,
        },
      ]
    );
  }

  #circle: Circle = null;
  #star: StarShape = null;
  #calc: TCalc;
  #color: Color;
  #backdropColor: Color;

  defaultValues = {
    sideNails: 50,
    sides: 16,
    layers: 4,
    layerSpread: 0.77,
    backdropSize: 0.26,
    backdropRadius: 0.9,
    backdropShift: 0.59,
    backdropColorCount: 2,
    centerRadius: 0.2,
    maxCurveSize: 32 / 50,
    rotation: 0.5,
    saturation: 73,
    multicolorStart: 206,
    multicolorRange: 1,
    multicolorByLightness: true,
    minLightness: 35,
    maxLightness: 100,
    nailsColor: '#000000',
    backdropNailsColor: '#ffffff',
    backdropNailsRadius: 2.275,
  };

  getCalc(): TCalc {
    const { sideNails, backdropSize, layers } = this.config;

    return {
      backdropNails: Math.floor(sideNails * backdropSize),
    };
  }

  resetStructure() {
    super.resetStructure();

    this.#calc = null;
  }

  setUpDraw() {
    super.setUpDraw();

    const {
      margin = 0,
      layers,
      backdropRadius: backdropRadiusConfig = 1,
      backdropSize,
      rotation,
      sides,
      starRadius: starRadiusConfig = 1,
      backdropColorCount,
    } = this.config;
    const center = this.size.map(v => v / 2);
    const radius = Math.min(...center) - margin;
    const starRadius =
      backdropSize && starRadiusConfig < backdropRadiusConfig
        ? (radius * starRadiusConfig) / backdropRadiusConfig
        : radius;
    const backdropRadius =
      backdropRadiusConfig < starRadiusConfig
        ? (radius * backdropRadiusConfig) / starRadiusConfig
        : radius;

    if (!this.#calc) {
      this.#calc = this.getCalc();
    }

    const starConfig: StarShapeConfig = {
      ...this.config,
      radius: starRadius,
      size: this.size,
    };

    if (this.#star) {
      this.#star.setConfig(starConfig);
    } else {
      this.#star = new StarShape(starConfig);
    }

    this.#color = new Color({
      ...this.config,
      colorCount: layers,
    });

    this.#backdropColor = new Color({
      ...mapKeys(this.config, key => {
        const match = key.match(/^backdrop(\w)(.+)/);
        return match ? match[1].toLowerCase() + match[2] : key;
      }),
      colorCount: backdropColorCount,
    });
    const circleConfig: CircleConfig = {
      size: this.size,
      n: sides,
      rotation: -1 / sides / 2 + (rotation ? rotation / sides : 0),
      radius: backdropRadius,
    };

    if (this.#circle) {
      this.#circle.setConfig(circleConfig);
    } else {
      this.#circle = new Circle(circleConfig);
    }
  }

  *drawStar(size?: number): Generator<void> {
    yield* this.#star.generateStrings(this.renderer, { size });
  }

  *generateLayers(): Generator<void> {
    const { sideNails, layerSpread, layers } = this.config;

    for (let layer = 0; layer < layers; layer++) {
      const color = this.#color.getColor(layer);
      this.renderer.setColor(color);

      const layerSize = this.#getLayerSize(layer);
      yield* this.drawStar(layerSize);
    }
  }

  *drawBackdrop(): Generator<void> {
    // For each side, add a nail between two star sides, at the specified backdropRadius.
    // For the backdrop size, connect the nail to the number of points in the star for the two sides near the backdrop nail

    const { backdropNails } = this.#calc;
    const { sides, backdropShift, sideNails, backdropSkip } = this.config;

    const shouldSkip = backdropSkip && sides > 3;
    let prevPoint: Coordinates;
    let currentSide = 0;
    const shift = Math.floor(backdropShift * (sideNails - backdropNails));

    let currentSideIndex = shift + backdropNails - 1;

    for (let side = 0; side < sides; side++) {
      this.renderer.setColor(this.#backdropColor.getColor(side % 2 ? 0 : 1));
      const backdropPoint = this.#circle.getPoint(
        shouldSkip ? (side + 1) % sides : side
      );
      let alternate = false;
      const direction = side % 2 ? 1 : -1; // 1 if backdrop threading starts at the bottom and goes up, -1 if it goes down
      prevPoint = this.#star.getPoint(side, currentSideIndex);

      for (let i = 0; i < backdropNails; i++) {
        this.renderer.renderLines(prevPoint, backdropPoint);
        yield;

        currentSide = (alternate ? side : side + (shouldSkip ? 3 : 1)) % sides;
        prevPoint = this.#star.getPoint(currentSide, currentSideIndex);
        this.renderer.renderLines(backdropPoint, prevPoint);
        yield;

        if (i < backdropNails - 1) {
          alternate = !alternate;
          currentSideIndex += direction;
          const nextPoint = this.#star.getPoint(currentSide, currentSideIndex);
          this.renderer.renderLines(prevPoint, nextPoint);
          prevPoint = nextPoint;
        }
      }
    }
  }

  *generateStrings() {
    yield* this.drawBackdrop();
    yield* this.generateLayers();
  }

  drawNails() {
    const { backdropSize, backdropNailsColor, backdropNailsRadius } =
      this.config;

    this.#star.drawNails(this.nails);
    if (backdropSize) {
      const circleNails = [];
      for (const circleNail of this.#circle.generateNails()) {
        circleNails.push(circleNail);
      }
      this.nails.addGroup(circleNails, {
        color: backdropNailsColor,
        radius: backdropNailsRadius,
      });
    }
  }

  #getLayerSize(layer: number): number {
    const { layers, layerSpread, sideNails } = this.config;
    return Math.max(
      1,
      sideNails -
        layer * Math.max(1, Math.floor((sideNails / layers) * layerSpread))
    );
  }

  getStepCount() {
    const { layers, sides } = this.config;
    const { backdropNails } = this.getCalc();

    const backdropStepCount = sides * backdropNails * 2;

    let stepCount = backdropStepCount;
    for (let layer = 0; layer < layers; layer++) {
      const layerSize = this.#getLayerSize(layer);
      stepCount += StarShape.getStepCount(this.config, { size: layerSize });
    }

    return stepCount;
  }

  static thumbnailConfig = {
    sideNails: 10,
    backdropNailsRadius: 0.5,
  };
}
