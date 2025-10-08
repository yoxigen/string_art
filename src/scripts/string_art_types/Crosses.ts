import StringArt from '../StringArt';
import Circle from '../shapes/Circle';
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
import StarShape from '../shapes/StarShape';
import { Coordinates } from '../types/general.types';

interface CrossesConfig extends ColorConfig {
  n: number;
  centerRadius: number;
  isVertical: boolean;
  verticalShift?: number;
  horizontalShift?: number;
}

type TCalc = {
  stars: StarShape[];
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

export default class Crosses extends StringArt<CrossesConfig, TCalc> {
  static type = 'crosses';

  name = 'Crosses';
  id = 'crosses';
  controls: ControlsConfig<CrossesConfig> = [
    {
      type: 'range',
      key: 'n',
      label: 'Nails per side',
      attr: {
        min: 2,
        max: 50,
        step: 1,
      },
      defaultValue: 20,
      isStructural: true,
    },
    {
      key: 'centerRadius',
      type: 'range',
      label: 'Center radius',
      attr: {
        min: 0,
        max: 1,
        step: ({ n }) => 1 / n,
      },
      displayValue: ({ centerRadius }) => formatFractionAsPercent(centerRadius),
      defaultValue: 0.5,
      affectsStepCount: false,
      isStructural: true,
    },
    {
      key: 'isVertical',
      type: 'checkbox',
      label: 'Vertical',
      defaultValue: true,
      affectsStepCount: false,
      isStructural: true,
    },
    {
      key: 'verticalShift',
      type: 'range',
      label: 'Vertical shift',
      attr: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      displayValue: ({ verticalShift }) =>
        formatFractionAsPercent(verticalShift),
      defaultValue: 0.5,
      affectsStepCount: false,
      isStructural: true,
      show: ({ centerRadius }) => centerRadius > 0,
    },
    COLOR_CONFIG,
  ];

  color: Color;

  getCalc({ size }: CalcOptions): TCalc {
    const sizeCenter = this.center;
    const { n, centerRadius, isVertical, margin, verticalShift } = this.config;
    const length = (isVertical ? size[1] : size[0]) - 2 * margin;

    let radius =
      length /
      (4 * (1 - centerRadius * verticalShift) +
        2 * centerRadius * (1 - verticalShift));

    const stars = new Array(3).fill(null).map((_, i) => {
      const starCenter =
        i === 1
          ? isVertical
            ? sizeCenter[1]
            : sizeCenter[0]
          : i === 0
          ? margin + radius * (1 - centerRadius * verticalShift)
          : margin + length - radius * (1 - centerRadius * verticalShift);
      return new StarShape({
        sideNails: n,
        sides: 4,
        centerRadius,
        center: isVertical
          ? [sizeCenter[0], starCenter]
          : [starCenter, sizeCenter[1]],
        radius,
        rotation: isVertical ? 2 : 1,
        sidesCenterRadiusShift: [verticalShift, 0, verticalShift, 0],
      });
    });

    return { stars };
  }

  getAspectRatio(): number {
    const { isVertical } = this.config;
    return isVertical ? 1 / 3 : 3;
  }

  private *connectSides(
    renderer: Renderer,
    {
      from,
      to,
      fromSide,
      toSide,
      isReverse = false,
    }: {
      from: StarShape;
      to: StarShape;
      fromSide: number;
      toSide: number;
      isReverse?: boolean;
    }
  ): Generator<void> {
    const { n } = this.config;

    for (let i = 0; i < n; i++) {
      renderer.renderLine(
        from.getSidePoint(fromSide, isReverse ? n - 1 - i : i),
        to.getSidePoint(toSide, n - i - 1)
      );
      yield;
    }
  }

  *drawStrings(renderer: Renderer) {
    const { stars } = this.calc;
    renderer.setColor('#ffffff');
    const connections = [
      [0, 0, 0, 1],
      [0, 1, 0, 1],
      [0, 0, 0, 3],
      [0, 1, 0, 3],
      [1, 0, 0, 3],
      [1, 0, 0, 1],
      [1, 1, 0, 1],
      [1, 1, 0, 3],
      [2, 2, 2, 1],
      [2, 2, 2, 3],
      [2, 1, 2, 1],
      [2, 1, 2, 3],
      [1, 1, 1, 2],
      [1, 1, 3, 2],
      [1, 2, 2, 1],
      [1, 2, 2, 3],
      [2, 1, 3, 0],
      [2, 1, 1, 0],
      [0, 1, 1, 2],
      [0, 1, 3, 2],
    ];

    for (const [from, to, fromSide, toSide] of connections) {
      const isReverse = from === 1 && (to === 0 || to === 2);

      yield* this.connectSides(renderer, {
        from: stars[from],
        to: stars[to],
        fromSide,
        toSide,
        isReverse,
      });
    }
  }

  getStepCount(): number {
    const { n } = this.config;
    const perStarCount = 4 * n;
    return perStarCount * 3 + n + 8 * n;
  }

  drawNails() {
    this.calc.stars.forEach((star, i) =>
      star.drawNails(this.nails, {
        excludeSides: i === 0 ? [2] : i === 2 ? [0] : null,
        getNumber: (side, sideIndex) =>
          `${String.fromCharCode(65 + i)}_${side}_${sideIndex + 1}`,
      })
    );
  }
}
