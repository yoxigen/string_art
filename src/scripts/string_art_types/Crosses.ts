import StringArt from '../StringArt';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorValue } from '../helpers/color/color.types';
import Renderer from '../renderers/Renderer';
import { Config, ControlsConfig } from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import { formatFractionAsPercent } from '../helpers/string_utils';
import { Line } from '../shapes/Line';

interface CrossesConfig extends ColorConfig {
  n: number;
  orientation: 'vertical' | 'horizontal';
  verticalGap: number;
  horizontalGap?: number;
}

type TCalc = {
  verticalLines: Line[];
  horizontalLines: Line[][];
  width: number;
  height: number;
};

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    colorCount: 2,
    color: '#ffffff',
    multicolorRange: 1,
    multicolorStart: 1,
    multicolorByLightness: true,
    minLightness: 40,
    maxLightness: 100,
    reverseColors: true,
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
      defaultValue: 25,
      isStructural: true,
    },
    {
      key: 'orientation',
      type: 'select',
      label: 'Orientation',
      defaultValue: 'vertical',
      options: [
        { value: 'vertical', label: '↕ Vertical' },
        { value: 'horizontal', label: '↔ Horizontal' },
      ],
      affectsStepCount: false,
      isStructural: true,
    },
    {
      key: 'verticalGap',
      type: 'range',
      label: 'Vertical gap',
      attr: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      displayValue: ({ verticalGap }) => formatFractionAsPercent(verticalGap),
      defaultValue: 0.27,
      affectsStepCount: false,
      isStructural: true,
    },
    {
      key: 'horizontalGap',
      type: 'range',
      label: 'Horizontal gap',
      attr: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      displayValue: ({ horizontalGap }) =>
        formatFractionAsPercent(horizontalGap),
      defaultValue: 0.43,
      affectsStepCount: false,
      isStructural: true,
    },
    COLOR_CONFIG,
  ];

  color: Color;

  getCalc({ size }: CalcOptions): TCalc {
    const center = this.center;
    const {
      n,
      orientation,
      margin,
      verticalGap: verticalGapPercent,
      horizontalGap,
    } = this.config;
    const isVertical = orientation === 'vertical';
    const length = (isVertical ? size[1] : size[0]) - 2 * margin;
    const maxVerticalGap = (length * 0.8) / 3;
    const verticalGap = verticalGapPercent * maxVerticalGap;
    const lineLength = (length - 3 * verticalGap) / 4;

    const verticalLines = new Array(4).fill(null).map((_, i) => {
      return new Line({
        from: isVertical
          ? [center[0], margin + i * (lineLength + verticalGap)]
          : [margin + i * (lineLength + verticalGap), center[1]],
        to: isVertical
          ? [center[0], margin + i * (lineLength + verticalGap) + lineLength]
          : [margin + i * (lineLength + verticalGap) + lineLength, center[1]],
        n,
      });
    });

    const horizontalStart =
      center[isVertical ? 0 : 1] - horizontalGap * lineLength - lineLength;
    const horizontalEnd =
      center[isVertical ? 0 : 1] + horizontalGap * lineLength + lineLength;

    const horizontalLines = new Array(3).fill(null).map((_, row) => {
      const rowTop =
        margin +
        lineLength +
        verticalGap / 2 +
        row * (lineLength + verticalGap);

      return [
        new Line({
          from: isVertical
            ? [horizontalStart, rowTop]
            : [rowTop, horizontalStart],
          to: isVertical
            ? [horizontalStart + lineLength, rowTop]
            : [rowTop, horizontalStart + lineLength],
          n,
        }),
        new Line({
          to: isVertical
            ? [horizontalEnd - lineLength, rowTop]
            : [rowTop, horizontalEnd - lineLength],
          from: isVertical ? [horizontalEnd, rowTop] : [rowTop, horizontalEnd],
          n,
        }),
      ];
    });
    return {
      verticalLines,
      horizontalLines,
      width: horizontalStart - horizontalEnd,
      height: length,
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    const { colorCount } = this.config;

    this.color = new Color({
      ...this.config,
      colorCount,
    });
  }

  getAspectRatio(): number {
    const { width, height } = this.calc;
    return width / height;
  }

  private *connectLines(
    renderer: Renderer,
    {
      verticalLine,
      row,
      isReverse = false,
      color,
    }: {
      verticalLine: Line;
      row: number;
      isReverse?: boolean;
      color: ColorValue;
    }
  ): Generator<void> {
    const { n } = this.config;
    const horizontalLines = this.calc.horizontalLines[row];

    renderer.setColor(color);
    renderer.setStartingPoint(horizontalLines[0].getPoint(0));

    let alternate = false;
    let currentLine: Line;

    for (let i = 0; i < n; i++) {
      if (currentLine) {
        renderer.lineTo(currentLine.getPoint(i));
        yield;
      }
      renderer.lineTo(verticalLine.getPoint(isReverse ? i : n - 1 - i));
      yield;

      currentLine = horizontalLines[alternate ? 0 : 1];
      renderer.lineTo(currentLine.getPoint(i));
      yield;

      alternate = !alternate;
    }
  }

  *drawStrings(renderer: Renderer) {
    const { verticalLines, horizontalLines } = this.calc;
    const connections = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [3, 2],
      [3, 1],
      [2, 1],
      [2, 2],
      [1, 2],
      [2, 0],
    ];

    for (const [verticalIndex, horizontalRow] of connections) {
      const isReverse = horizontalRow < verticalIndex;

      yield* this.connectLines(renderer, {
        verticalLine: verticalLines[verticalIndex],
        row: horizontalRow,
        isReverse,
        color: this.color.getColor(
          horizontalRow > verticalIndex || verticalIndex - horizontalRow > 1
            ? 1
            : 0
        ),
      });
    }
  }

  getStepCount(): number {
    const { n } = this.config;
    return 10 * (3 * n - 1);
  }

  drawNails() {
    this.calc.verticalLines.forEach((line, i) =>
      line.drawNails(this.nails, {
        getNumber: sideIndex =>
          `${String.fromCharCode(65 + i)}_${sideIndex + 1}`,
      })
    );

    this.calc.horizontalLines.forEach(([leftLine, rightLine], row) => {
      leftLine.drawNails(this.nails, {
        getNumber: sideIndex => `L_${row + 1}_${sideIndex}`,
      });
      rightLine.drawNails(this.nails, {
        getNumber: sideIndex => `R_${row + 1}_${sideIndex}`,
      });
    });
  }

  thumbnailConfig = (config: CrossesConfig) => ({
    n: Math.min(6, config.n),
  });
}
