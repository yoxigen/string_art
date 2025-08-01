import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';
import Color from '../helpers/Color.js';
import StarShape from '../helpers/StarShape.js';
import { insertAfter } from '../helpers/config_utils.js';
import { mapKeys } from '../helpers/object_utils.js';
import { formatFractionAsPercent } from '../helpers/string_utils.js';

export default class Sun extends StringArt {
  name = 'Sun';
  id = 'sun';
  controls = [
    {
      key: 'starGroup',
      label: 'Star',
      type: 'group',
      children: [
        ...insertAfter(
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
                min: ({ config: { sideNails, layers } }) =>
                  1 / (layers * sideNails),
                max: ({ config: { layers } }) => 1 / (layers - 1) - 0.02,
                step: ({ config: { sideNails, layers } }) =>
                  1 / (layers * sideNails),
              },
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
            step: ({ config: { sideNails } }) => 1 / sideNails,
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
            step: ({ config: { sideNails, backdropSize } }) =>
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
        Color.getConfig({
          defaults: {
            isMultiColor: true,
            multicolorRange: 1,
            multicolorStart: 237,
            color: '#ffffff',
            backdropColorCount: 2,
            saturation: 40,
            multicolorByLightness: true,
            minLightness: 20,
            maxLightness: 97,
          },
          exclude: ['colorCount'],
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
        }),
      ],
    },
  ];

  #circle = null;
  #star = null;

  defaultValues = {
    sideNails: 50,
    sides: 16,
    layers: 4,
    layerSpread: 9 / 50,
    backdropSize: 0.35,
    backdropRadius: 0.91,
    backdropShift: 0.5,
    centerRadius: 0.2,
    maxCurveSize: 32 / 50,
    rotation: 0.5,
    saturation: 50,
    multicolorStart: 206,
    multicolorRange: 1,
    multicolorByLightness: true,
    minLightness: 33,
    maxLightness: 90,
  };

  getCalc() {
    const { sideNails, backdropSize } = this.config;

    return {
      backdropNails: Math.floor(sideNails * backdropSize),
    };
  }

  resetStructure() {
    super.resetStructure();

    this.calc = null;
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

    if (!this.calc) {
      this.calc = this.getCalc();
    }

    const starConfig = {
      ...this.config,
      radius: starRadius,
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

    this.backdropColor = new Color({
      ...mapKeys(this.config, key => {
        const match = key.match(/^backdrop(\w)(.+)/);
        return match ? match[1].toLowerCase() + match[2] : key;
      }),
      colorCount: 2,
    });
    const circleConfig = {
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

  *drawBackdrop() {
    // For each side, add a nail between two star sides, at the specified backdropRadius.
    // For the backdrop size, connect the nail to the number of points in the star for the two sides near the backdrop nail

    const { backdropNails } = this.calc;
    const { sides, backdropShift, sideNails, backdropSkip } = this.config;

    const shouldSkip = backdropSkip && sides > 3;
    let prevPoint;
    let currentSide = 0;
    const shift = Math.floor(backdropShift * (sideNails - backdropNails));

    let currentSideIndex = shift + backdropNails - 1;

    for (let side = 0; side < sides; side++) {
      this.renderer.setColor(this.backdropColor.getColor(side % 2 ? 0 : 1));
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
    this.#star.drawNails(this.nails);
    if (this.config.backdropSize) {
      this.#circle.drawNails(this.nails);
    }
  }

  getStepCount() {
    const { layers, layerSpread, sideNails, sides } = this.config;
    const { backdropNails } = this.getCalc();

    const backdropStepCount = sides * backdropNails * 2;

    let stepCount = backdropStepCount;
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
