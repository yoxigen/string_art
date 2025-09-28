import StringArt from '../StringArt';
import Circle, { CircleConfig } from '../shapes/Circle';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorMap } from '../helpers/color/color.types';
import Renderer from '../renderers/Renderer';
import {
  ControlConfig,
  ControlsConfig,
  GroupValue,
} from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import { Shape } from '../shapes/Shape';
import { mapDimensions } from '../helpers/size_utils';
import Polygon from '../shapes/Polygon';
import { formatFractionAsPercent } from '../helpers/string_utils';
import { gcd } from '../helpers/math_utils';

type ShapeType = 'circle' | 'polygon';

interface DanceOfPlanetsConfig extends ColorConfig {
  rounds: number;

  shape1: GroupValue;
  shape1Type: ShapeType;
  shape1Size: number;
  shape1NailCount: number;
  shape1Sides: number;
  shape1Rotation: number;

  shape2: GroupValue;
  shape2Type: ShapeType;
  shape2Size: number;
  shape2NailCount: number;
  shape2Sides: number;
  shape2Rotation: number;
  identicalNailCount: boolean;
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
      {
        key: `shape${shapeIndex}Size`,
        label: 'Size',
        type: 'range',
        attr: {
          min: 0.1,
          max: 1,
          step: 0.01,
        },
        defaultValue: 1,
        displayValue: (config: DanceOfPlanetsConfig) =>
          formatFractionAsPercent(config[`shape${shapeIndex}Size`]),
        isStructural: true,
        affectsStepCount: false,
      },
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
        show: (config: DanceOfPlanetsConfig) =>
          config[`shape${shapeIndex}Type`] === 'polygon',
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
          max: 1300,
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
        displayValue: (config: DanceOfPlanetsConfig) =>
          `${Math.round(config[`shape${shapeIndex}Rotation`] * 360)}°`,
        isStructural: true,
      },
    ].filter(v => v != null),
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
    COLOR_CONFIG,
  ];

  defaultValues: Partial<DanceOfPlanetsConfig> = {
    shape1Type: 'circle',
    shape1Size: 1,
    shape1NailCount: 160,
    shape2Type: 'circle',
    shape2Size: 0.5,
    shape2NailCount: 100,
  };

  color: Color;
  colorMap: ColorMap;

  getCalc({ size }: CalcOptions): TCalc {
    const center = this.center;
    const { margin } = this.config;

    function getShape({
      type,
      diameter,
      nailCount,
      sides,
      rotation = 0,
    }: {
      type: ShapeType;
      diameter: number;
      nailCount: number;
      sides?: number;
      rotation?: number;
    }): Shape {
      if (type === 'circle') {
        return new Circle({
          size,
          n: nailCount,
          radius: (Math.min(...size) * diameter) / 2,
          center,
          margin,
          reverse: true,
          rotation,
        });
      } else {
        sides = sides ?? 3;
        nailCount = Math.max(nailCount, sides);

        return new Polygon({
          size: mapDimensions(size, v => v * diameter),
          sides: sides ?? 3,
          nailsSpacing: 1 / (nailCount / sides),
          center,
          margin,
          rotation,
        });
      }
    }

    const shape2NailCount = this.config.identicalNailCount
      ? this.config.shape1NailCount
      : this.config.shape2NailCount;

    return {
      shape1: getShape({
        type: this.config.shape1Type,
        diameter: this.config.shape1Size,
        nailCount: this.config.shape1NailCount,
        sides: this.config.shape1Sides,
        rotation: this.config.shape1Rotation,
      }),
      shape2: getShape({
        type: this.config.shape2Type,
        diameter: this.config.shape2Size,
        nailCount: shape2NailCount,
        sides: this.config.shape2Sides,
        rotation: this.config.shape2Rotation,
      }),
      // TODO: polygon nail count should be a multiple of the sides
      shape1NailCount:
        this.config.shape1Type === 'circle'
          ? this.config.shape1NailCount
          : Math.max(this.config.shape1NailCount, this.config.shape1Sides),
      shape2NailCount:
        this.config.shape2Type === 'circle'
          ? shape2NailCount
          : Math.max(shape2NailCount, this.config.shape2Sides),
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    const { colorCount, shape1NailCount, shape2NailCount, rounds } =
      this.config;

    this.color = new Color({
      ...this.config,
      colorCount: colorCount,
    });

    if (colorCount) {
      this.colorMap = this.color.getColorMap({
        stepCount: this.#getConnectionCount(),
        colorCount,
      });
    }
  }

  getAspectRatio(calcOptions: CalcOptions): number {
    return 1;
  }

  #getConnectionCount(): number {
    const { shape1NailCount, shape2NailCount } = this.calc;
    const nailCountsGcd = gcd(shape1NailCount, shape2NailCount);
    const greaterNailCount = Math.max(shape1NailCount, shape2NailCount);

    return Math.max(
      greaterNailCount,
      (Math.min(shape1NailCount, shape2NailCount) * greaterNailCount) /
        nailCountsGcd
    );
  }

  *drawStrings(renderer: Renderer) {
    const { shape1, shape2, shape1NailCount, shape2NailCount } = this.calc;
    const steps = this.#getConnectionCount();

    renderer.setColor('#ffffff');
    renderer.setStartingPoint(shape1.getPoint(0));

    let toShape2 = true;

    for (let step = 0; step < steps; step++) {
      const stepColor = this.colorMap.get(step);
      if (stepColor) {
        renderer.setColor(stepColor);
      }

      renderer.lineTo(
        toShape2
          ? shape2.getPoint(step % shape2NailCount)
          : shape1.getPoint(step % shape1NailCount)
      );
      yield;

      if (step !== steps - 1) {
        renderer.lineTo(
          toShape2
            ? shape2.getPoint((step + 1) % shape2NailCount)
            : shape1.getPoint((step + 1) % shape1NailCount)
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

  drawNails() {
    this.calc.shape1.drawNails(this.nails);
    this.calc.shape2.drawNails(this.nails);
  }
}
