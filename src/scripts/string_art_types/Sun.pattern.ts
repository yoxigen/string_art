import StringArt from '../infra/StringArt';
import Circle, { CircleConfig } from '../shapes/Circle';
import Color from '../helpers/color/Color';
import StarShape, { StarShapeConfig } from '../shapes/StarShape';
import { insertAfter } from '../helpers/config_utils';
import { mapKeys } from '../helpers/object_utils';
import { formatFractionAsPercent } from '../helpers/string_utils';
import type {
  ControlConfig,
  ControlsConfig,
  GroupValue,
} from '../types/config.types';
import { ColorConfig, ColorValue } from '../helpers/color/color.types';
import { CalcOptions } from '../types/stringart.types';
import {
  combineBoundingRects,
  getBoundingRectAspectRatio,
  getCenter,
} from '../helpers/size_utils';
import NailsGroup from '../infra/nails/NailsGroup';
import NailsSetter from '../infra/nails/NailsSetter';
import Controller from '../infra/Controller';
import { COMMON_CONFIG_CONTROLS } from '../infra/common_controls';
import { createArray } from '../helpers/array_utils';

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
  star: StarShape;
  circle: Circle;
}

export default class Sun extends StringArt<SunConfig, TCalc> {
  static type = 'sun';

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
            // @ts-ignore
            ...StarShape.StarConfig,
            // @ts-ignore
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
          affectsNails: false,
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
            const control: Partial<ControlConfig<any>> = {
              key: 'backdrop' + key[0].toUpperCase() + key.slice(1),
              show: show
                ? ({ backdropIsMultiColor }) =>
                    key === 'color'
                      ? !backdropIsMultiColor
                      : backdropIsMultiColor
                : null,
            };

            if (key === 'multicolorRange') {
              control.attr = {
                start: ({ backdropMulticolorStart }) => backdropMulticolorStart,
                type: 'range',
              };
            }
            return control;
          },
          groupLabel: 'Backdrop color',
          maxColorCount: 2,
        }),
      ],
    },
  ];

  getCommonControls(): ControlsConfig<Partial<SunConfig>> {
    return insertAfter<Partial<SunConfig>>(
      COMMON_CONFIG_CONTROLS,
      'nailsColor',
      [
        {
          key: 'backdropNailsColor',
          label: 'Backdrop nails color',
          type: 'color',
          defaultValue: '#ffffff',
          show: ({ showNails }) => showNails,
          affectsStrings: false,
        },
        {
          key: 'backdropNailsRadius',
          label: 'Backdrop nails radius',
          type: 'range',
          defaultValue: 1.5,
          attr: { min: 0.5, max: 5, step: 0.25 },
          show: ({ showNails }) => showNails,
          affectsStrings: false,
        },
      ]
    );
  }

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

  getCalc({ size }: CalcOptions): TCalc {
    const {
      margin = 0,
      sideNails,
      backdropRadius: backdropRadiusConfig = 1,
      backdropSize,
      rotation,
      sides,
      starRadius: starRadiusConfig = 1,
    } = this.config;
    const center = getCenter(size);
    const radius = Math.min(...center) - margin;
    const starRadius =
      backdropSize && starRadiusConfig < backdropRadiusConfig
        ? (radius * starRadiusConfig) / backdropRadiusConfig
        : radius;
    const backdropRadius =
      backdropRadiusConfig < starRadiusConfig
        ? (radius * backdropRadiusConfig) / starRadiusConfig
        : radius;

    const starConfig: StarShapeConfig = {
      ...this.config,
      radius: starRadius,
      size,
    };

    const circleConfig: CircleConfig = {
      size,
      n: sides,
      rotation: -1 / sides / 2 + (rotation ? rotation / sides : 0),
      radius: backdropRadius,
    };

    return {
      backdropNails: Math.floor(sideNails * backdropSize),
      star: new StarShape(starConfig),
      circle: new Circle(circleConfig),
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);

    const { layers, backdropColorCount } = this.config;

    this.#color = new Color({
      ...this.config,
      colorCount: layers,
    });

    // @ts-ignore this is fine for now, until the color config is managed in a single control
    this.#backdropColor = new Color({
      ...mapKeys(this.config, key => {
        const match = key.match(/^backdrop(\w)(.+)/);
        return match ? match[1].toLowerCase() + match[2] : key;
      }),
      colorCount: backdropColorCount,
    });
  }

  getAspectRatio(options: CalcOptions): number {
    const calc = this.getCalc(options);
    const boundingRect = combineBoundingRects(
      calc.circle.getBoundingRect(),
      calc.star.getBoundingRect()
    );
    return getBoundingRectAspectRatio(boundingRect);
  }

  *drawBackdrop(controller: Controller): Generator<void> {
    // For each side, add a nail between two star sides, at the specified backdropRadius.
    // For the backdrop size, connect the nail to the number of points in the star for the two sides near the backdrop nail

    const { backdropNails, circle, star } = this.calc;
    const {
      sides,
      backdropShift,
      sideNails,
      backdropSkip,
      backdropIsMultiColor,
      backdropColorCount,
    } = this.config;

    const shouldSkip = backdropSkip && sides > 3;
    let currentSide = 0;
    const shift = Math.floor(backdropShift * (sideNails - backdropNails));
    let currentSideIndex = shift + backdropNails - 1;

    function* genSideDirections(side: number): Generator<void> {
      let alternate = false;
      const direction = side % 2 ? 1 : -1; // 1 if backdrop threading starts at the bottom and goes up, -1 if it goes down
      controller.goto(star.getSideNailKey(side, currentSideIndex));

      const backdropNailKey = circle.getNailKey(
        shouldSkip ? (side + 1) % sides : side
      );
      for (let i = 0; i < backdropNails; i++) {
        yield controller.stringTo(backdropNailKey, 'backdrop');

        currentSide = (alternate ? side : side + (shouldSkip ? 3 : 1)) % sides;
        yield controller.stringTo(
          star.getSideNailKey(currentSide, currentSideIndex)
        );

        if (i < backdropNails - 1) {
          alternate = !alternate;
          currentSideIndex += direction;
          yield controller.stringTo(
            star.getSideNailKey(currentSide, currentSideIndex)
          );
        }
      }
    }

    function* genAllSidesDirections(): Generator<void> {
      for (let side = 0; side < sides; side++) {
        yield* genSideDirections(side);
      }
    }

    if (!backdropIsMultiColor || backdropColorCount === 1) {
      controller.startLayer({
        name: 'Backdrop',
        color: this.#backdropColor.getColor(0),
      });
      yield* genAllSidesDirections();
    } else {
      const layers: Map<number, { name: string; color: ColorValue }> = new Map(
        createArray(2, i => [
          i,
          {
            name: `Backdrop #${i + 1}`,
            color: this.#backdropColor.getColor(i),
          },
        ])
      );

      for (let side = 0; side < sides; side++) {
        controller.startLayer(layers.get(side % 2));
        yield* genSideDirections(side);
      }
    }
  }

  *drawStrings(controller: Controller): Generator<void> {
    yield* this.drawBackdrop(controller);

    for (let layerIndex = 0; layerIndex < this.config.layers; layerIndex++) {
      controller.startLayer({
        name: `Layer ${layerIndex + 1}`,
        color: this.#color.getColor(layerIndex),
      });
      yield* this.calc.star.drawStar(controller, {
        size: this.#getLayerSize(layerIndex),
      });
    }
  }

  drawNails(nails: NailsSetter) {
    const { backdropSize, backdropNailsColor, backdropNailsRadius } =
      this.config;

    this.calc.star.drawNails(nails);
    if (backdropSize) {
      const backdropNailsGroup = new NailsGroup({
        color: backdropNailsColor,
        radius: backdropNailsRadius,
      });

      this.calc.circle.drawNails(backdropNailsGroup);
      nails.addGroup(backdropNailsGroup, 'backdrop');
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

  getStepCount(options: CalcOptions) {
    const { layers, sides } = this.config;
    const { backdropNails } = this.getCalc(options);

    const backdropStepCount = sides * (backdropNails * 3 - 1);

    let stepCount = backdropStepCount;
    for (let layer = 0; layer < layers; layer++) {
      const layerSize = this.#getLayerSize(layer);
      stepCount += StarShape.getStepCount(this.config, { size: layerSize });
    }

    return stepCount;
  }

  thumbnailConfig = ({ sideNails, backdropNailsRadius }) => ({
    sideNails: Math.min(sideNails, 10),
    backdropNailsRadius: Math.min(backdropNailsRadius, 0.5),
  });
}
