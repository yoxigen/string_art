import StringArt from '../infra/StringArt';
import Circle from '../shapes/Circle';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorMap } from '../helpers/color/color.types';
import {
  ControlConfig,
  ControlsConfig,
  GroupValue,
} from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import type Shape from '../shapes/Shape';
import { getCenter, mapDimensions } from '../helpers/size_utils';
import Polygon from '../shapes/Polygon';
import {
  formatFractionAsAngle,
  formatFractionAsPercent,
} from '../helpers/string_utils';
import { Dimensions } from '../types/general.types';
import NailsSetter from '../infra/nails/NailsSetter';
import { ShapeConfig } from '../shapes/Shape';
import Controller from '../infra/Controller';

type ShapeType = 'circle' | 'polygon';

interface DanceOfPlanetsConfig extends ColorConfig {
  rounds: number;
  reverse: boolean;

  shape1: GroupValue;
  shape1Type: ShapeType;
  shape1NailCount: number;
  shape1Sides: number;
  shape1Rotation: number;
  shape1Distortion: number;

  shape2: GroupValue;
  shape2Type: ShapeType;
  shape2Size: number;
  shape2NailCount: number;
  shape2Sides: number;
  shape2Rotation: number;
  identicalNailCount: boolean;
  shape2Distortion: number;
}

type TCalc = {
  shape1: Shape;
  shape2: Shape;
  shape1NailCount: number;
  shape2NailCount: number;
};

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    colorCount: 7,
    color: '#ffbb29',
    multicolorRange: 21,
    multicolorStart: 32,
    multicolorByLightness: true,
    minLightness: 36,
    maxLightness: 98,
  },
});

function getShapeControlsGroup(
  label: string,
  shapeIndex: 1 | 2
): ControlConfig<Partial<DanceOfPlanetsConfig>> {
  return {
    key: `shape${shapeIndex}`,
    label,
    type: 'group',
    // @ts-ignore
    children: [
      {
        key: `shape${shapeIndex}Type`,
        label: 'Type',
        type: 'select',
        defaultValue: 'circle',
        options: [
          { value: 'circle', label: 'Circle' },
          { value: 'polygon', label: 'Polygon' },
        ],
        isStructural: true,
      },
      shapeIndex === 2
        ? {
            key: `shape${shapeIndex}Size`,
            label: 'Size',
            type: 'range',
            attr: {
              min: 0.1,
              max: 1,
              step: 0.01,
            },
            defaultValue: 1,
            displayValue: (config: Partial<DanceOfPlanetsConfig>) =>
              formatFractionAsPercent(config[`shape${shapeIndex}Size`]),
            isStructural: true,
            affectsStepCount: false,
          }
        : undefined,
      {
        key: `shape${shapeIndex}Sides`,
        label: 'Sides',
        type: 'range',
        attr: {
          min: 3,
          max: 24,
          step: 1,
        },
        defaultValue: 7,
        isStructural: true,
        show: (config: Partial<DanceOfPlanetsConfig>) =>
          config[`shape${shapeIndex}Type`] === 'polygon',
      },
      {
        ...Circle.distortionConfig,
        key: `shape${shapeIndex}Distortion`,
        show: (config: Partial<DanceOfPlanetsConfig>) =>
          config[`shape${shapeIndex}Type`] === 'circle',
      },
      shapeIndex === 2
        ? {
            key: 'identicalNailCount',
            label: 'Nail count as outer shape',
            type: 'checkbox',
            defaultValue: false,
            isStructural: true,
          }
        : null,
      {
        key: `shape${shapeIndex}NailCount`,
        label: 'Nail count',
        type: 'range',
        attr: {
          min: 3,
          max: 400,
          step: 1,
        },
        defaultValue: 100,
        isStructural: true,
        show: ({ identicalNailCount }) =>
          shapeIndex === 1 || !identicalNailCount,
      },
      {
        key: `shape${shapeIndex}Rotation`,
        label: 'Rotation',
        type: 'range',
        attr: {
          min: 0,
          max: 1,
          step: 0.0027,
        },
        defaultValue: 0,
        displayValue: (config: Partial<DanceOfPlanetsConfig>) =>
          formatFractionAsAngle(config[`shape${shapeIndex}Rotation`]),
        isStructural: true,
      },
    ].filter(Boolean),
  };
}

export default class DanceOfPlanets extends StringArt<
  DanceOfPlanetsConfig,
  TCalc
> {
  static type = 'dance_of_planets';

  name = 'Dance of Planets';
  id = 'dance_of_planets';
  controls: ControlsConfig<DanceOfPlanetsConfig> = [
    getShapeControlsGroup('Outer shape', 1),
    getShapeControlsGroup('Inner shape', 2),
    {
      type: 'range',
      key: 'rounds',
      label: 'Rounds',
      attr: {
        min: 1,
        max: 30,
        step: 1,
      },
      defaultValue: 1,
      affectsNails: false,
    },
    {
      key: 'reverse',
      type: 'checkbox',
      label: 'Reverse order',
      description:
        'If on, while the first shape advances in one direction, the second shape advances in the opposite direction',
      defaultValue: false,
      isStructural: false,
      affectsNails: false,
    },
    COLOR_CONFIG,
  ];

  defaultValues: Partial<DanceOfPlanetsConfig> = {
    shape1Type: 'circle',
    shape1NailCount: 150,
    shape1Rotation: 0,
    shape2Type: 'circle',
    shape2Size: 0.8,
    shape2NailCount: 117,
    shape2Distortion: -0.12,
    shape2Rotation: 0.216,
    rounds: 2,
    multicolorRange: 132,
    multicolorStart: 198,
    isMultiColor: true,
    multicolorByLightness: false,
    colorCount: 2,
  };

  color: Color;
  colorMap: ColorMap;

  getCalc({ size }: CalcOptions): TCalc {
    const { margin } = this.config;
    const center = getCenter(size);

    function getShape({
      type,
      diameter = 1,
      nailCount,
      sides,
      rotation = 0,
      distortion,
      getUniqueKey,
    }: {
      type: ShapeType;
      diameter?: number;
      nailCount: number;
      sides?: number;
      rotation?: number;
      distortion?: number;
      getUniqueKey?: ShapeConfig['getUniqueKey'];
    }): Shape {
      if (type === 'circle') {
        return new Circle({
          size: mapDimensions(size, v => v * diameter),
          n: Math.round(nailCount),
          radius: (Math.min(...size) * diameter) / 2,
          center,
          margin,
          reverse: true,
          rotation,
          distortion,
          getUniqueKey,
        });
      } else {
        sides = sides ?? 3;
        nailCount = Math.max(nailCount, sides);

        return new Polygon({
          size: mapDimensions(size, v => v * diameter),
          sides: sides ?? 3,
          nailsPerSide: Math.round(nailCount / sides),
          center,
          margin,
          rotation,
          getUniqueKey,
        });
      }
    }

    function getShapeNailCount(shape: Shape): number {
      if (shape instanceof Polygon) return shape.getNailsCount();

      if (shape instanceof Circle) {
        return shape.config.n;
      }

      return NaN;
    }

    const shape1 = getShape({
      type: this.config.shape1Type,
      nailCount: this.config.shape1NailCount,
      sides: this.config.shape1Sides,
      rotation: this.config.shape1Rotation,
      distortion: this.config.shape1Distortion,
    });

    const shape1NailCount = getShapeNailCount(shape1);

    const shape2 = getShape({
      type: this.config.shape2Type,
      diameter: this.config.shape2Size,
      nailCount: this.config.identicalNailCount
        ? shape1NailCount
        : this.config.shape2NailCount,
      sides: this.config.shape2Sides,
      rotation: this.config.shape2Rotation,
      distortion: this.config.shape2Distortion,
      getUniqueKey: k => k + shape1NailCount,
    });

    return {
      shape1,
      shape2,
      shape1NailCount,
      shape2NailCount: getShapeNailCount(shape2),
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    const { colorCount } = this.config;

    this.color = new Color(this.config);

    if (colorCount) {
      this.colorMap = this.color.getColorMap({
        stepCount: this.#getConnectionCount(),
        colorCount,
      });
    }
  }

  getAspectRatio(): number {
    const { shape1, shape2 } = this.calc ?? this.getCalc({ size: [100, 100] });
    const rect1 = shape1.getBoundingRect();
    const rect2 = shape2.getBoundingRect();

    return (
      Math.max(rect1.width, rect2.width) / Math.max(rect1.height, rect2.height)
    );
  }

  #getConnectionCount(): number {
    const { shape1NailCount, shape2NailCount } = this.calc;
    const greaterNailCount = Math.max(shape1NailCount, shape2NailCount);

    return greaterNailCount * this.config.rounds;
  }

  *drawStrings(controller: Controller) {
    const { shape1NailCount, shape2NailCount } = this.calc;
    const { reverse } = this.config;

    const steps = this.#getConnectionCount();

    controller.goto(0);

    let toShape2 = true;

    const getShape2Index = reverse
      ? (step: number) =>
          shape1NailCount +
          shape2NailCount -
          (step % shape2NailCount || shape2NailCount)
      : (step: number) => shape1NailCount + (step % shape2NailCount);

    for (let step = 0; step < steps; step++) {
      const stepColor = this.colorMap.get(step);
      if (stepColor) {
        controller.startLayer({ color: stepColor });
      }

      controller.stringTo(
        toShape2 ? getShape2Index(step) : step % shape1NailCount
      );
      yield;

      if (step !== steps - 1) {
        controller.stringTo(
          toShape2 ? getShape2Index(step + 1) : (step + 1) % shape1NailCount
        );
        yield;

        toShape2 = !toShape2;
      }
    }
  }

  getStepCount(options: CalcOptions): number {
    if (!this.calc) {
      this.calc = this.getCalc(options);
    }

    return this.#getConnectionCount() * 2 - 1;
  }

  getNailCount(size: Dimensions): number {
    const calc = this.getCalc({
      size,
    });
    return calc.shape1NailCount + calc.shape2NailCount;
  }

  drawNails(nails: NailsSetter) {
    this.calc.shape1.drawNails(nails);
    this.calc.shape2.drawNails(nails);
  }

  #getShapeNailCount(
    shapeType: ShapeType,
    nailCount: number,
    sides: number
  ): number {
    if (shapeType === 'circle') {
      return nailCount;
    }

    return nailCount <= sides ? sides : nailCount - (nailCount % sides);
  }

  thumbnailConfig = (
    config: DanceOfPlanetsConfig
  ): Partial<DanceOfPlanetsConfig> => {
    const MAX_NAIL_COUNT = 80;
    // the nail count of either shape shouldn't exceed the MAX_NAIL_COUNT,
    // but the ratio between the two counts needs to be preserved, so the pattern in the thumbnail looks similar

    let shape1NailCount = this.#getShapeNailCount(
      config.shape1Type,
      config.shape1NailCount,
      config.shape1Sides
    );

    let shape2NailCount = config.identicalNailCount
      ? shape1NailCount
      : config.shape2NailCount;

    if (
      shape1NailCount <= MAX_NAIL_COUNT &&
      shape2NailCount <= MAX_NAIL_COUNT
    ) {
      return {};
    }

    const ratio = shape1NailCount / shape2NailCount;

    if (ratio >= 1) {
      // shape1 has a larger or equal nail count than shape2
      shape1NailCount = MAX_NAIL_COUNT;
      shape2NailCount = MAX_NAIL_COUNT / ratio;
    } else {
      shape2NailCount = MAX_NAIL_COUNT;
      shape1NailCount = MAX_NAIL_COUNT * ratio;
    }

    return { shape1NailCount, shape2NailCount };
  };
}
