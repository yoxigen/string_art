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
        min: 1,
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
    COLOR_CONFIG,
  ];

  color: Color;

  getCalc({ size }: CalcOptions): TCalc {
    const sizeCenter = this.center;
    const { n, centerRadius, isVertical, margin } = this.config;
    const length = (isVertical ? size[1] : size[0]) - 2 * margin;

    let radius = length / (4 + 2 * centerRadius);

    const stars = new Array(3).fill(null).map((_, i) => {
      const starCenter = margin + (i + 1) * radius + i * centerRadius * radius;
      return new StarShape({
        sideNails: n,
        sides: 4,
        centerRadius,
        center: isVertical
          ? [sizeCenter[0], starCenter]
          : [starCenter, sizeCenter[1]],
        radius,
        rotation: isVertical ? 2 : 1,
      });
    });

    return { stars };
  }

  getAspectRatio(): number {
    const { isVertical } = this.config;
    return isVertical ? 1 / 3 : 3;
  }

  *drawStrings(renderer: Renderer) {}

  getStepCount(options: CalcOptions): number {
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
