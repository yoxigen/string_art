import StringArt from '../StringArt';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorValue } from '../helpers/color/color.types';
import Renderer from '../renderers/Renderer';
import { Config, ControlsConfig, GroupValue } from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import {
  capitalize,
  formatFractionAsAngle,
  formatFractionAsPercent,
} from '../helpers/string_utils';
import { Line, LineConfig } from '../shapes/Line';
import { Coordinates } from '../types/general.types';
import { getShapesBoundingRect } from '../helpers/shape_utils';
import { createArray } from '../helpers/array_utils';

type CrossesOrientation = 'v' | 'h';

interface CrossesConfig extends ColorConfig {
  n: number;
  orientation: CrossesOrientation;
  lengthGap: number;
  lockGap: boolean;
  widthGap?: number;
  fineControl: boolean;
  center: GroupValue;
  centerWidthGap?: number;
  centerSpread?: number;
  centerLengthSpread: number;
  centerLengthGap: number;
  lockCenterColor: boolean;
  centerColor: ColorValue;
  edges: GroupValue;
  edgesGap: number;
  edgesSpread: number;
  sidesRotation: number;
}

type TCalc = {
  verticalLines: Line[];
  horizontalLines: Line[][];
  width: number;
  height: number;
};

function getOtherOrientationLabel(
  orientation: CrossesOrientation
): 'horizontal' | 'vertical' {
  return orientation === 'h' ? 'vertical' : 'horizontal';
}

function getOrientationLabel(
  orientation: CrossesOrientation
): 'horizontal' | 'vertical' {
  return orientation === 'h' ? 'horizontal' : 'vertical';
}

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
        max: 100,
        step: 1,
      },
      defaultValue: 25,
      isStructural: true,
    },
    {
      key: 'orientation',
      type: 'select',
      label: 'Orientation',
      defaultValue: 'v',
      options: [
        { value: 'v', label: '↕ Vertical' },
        { value: 'h', label: '↔ Horizontal' },
      ],
      affectsStepCount: false,
      isStructural: true,
    },
    {
      key: 'sidesRotation',
      type: 'range',
      label: 'Sides rotation',
      attr: {
        min: -0.25,
        max: 0.25,
        step: 0.005,
        snap: '0',
      },
      displayValue: ({ sidesRotation }) => formatFractionAsAngle(sidesRotation),
      defaultValue: 0,
      affectsStepCount: false,
      isStructural: true,
    },
    {
      key: 'fineControl',
      type: 'checkbox',
      label: 'Fine control',
      defaultValue: false,
      affectsStepCount: false,
      isStructural: true,
    },
    {
      key: 'lockGap',
      type: 'checkbox',
      label: 'Lock horizontal/vertical gap',
      defaultValue: true,
      isStructural: true,
      affectsStepCount: false,
      show: ({ fineControl }) => !fineControl,
    },
    {
      key: 'lengthGap',
      type: 'range',
      label: ({ orientation, lockGap }) =>
        lockGap ? 'Gap' : `${capitalize(getOrientationLabel(orientation))} gap`,
      attr: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      displayValue: ({ lengthGap }) => formatFractionAsPercent(lengthGap),
      defaultValue: 0.27,
      affectsStepCount: false,
      isStructural: true,
      show: ({ fineControl }) => !fineControl,
    },
    {
      key: 'widthGap',
      type: 'range',
      label: ({ orientation }) =>
        `${capitalize(getOtherOrientationLabel(orientation))} gap`,
      attr: {
        min: 0,
        max: 5,
        step: 0.01,
      },
      displayValue: ({ widthGap }) => formatFractionAsPercent(widthGap),
      defaultValue: 0.43,
      affectsStepCount: false,
      isStructural: true,
      show: ({ lockGap, fineControl }) => !fineControl && !lockGap,
    },
    {
      key: 'center',
      type: 'group',
      label: 'Center ◈',
      show: ({ fineControl }) => fineControl,
      children: [
        {
          key: 'centerSpread',
          type: 'range',
          label: ({ orientation }) =>
            `Center ${getOtherOrientationLabel(orientation)} spread`,
          attr: {
            min: 0.2,
            max: 5,
            step: 0.01,
            snap: '1',
          },
          displayValue: ({ centerSpread }) =>
            formatFractionAsPercent(centerSpread),
          defaultValue: 1,
          affectsStepCount: false,
          isStructural: true,
        },
        {
          key: 'centerLengthSpread',
          type: 'range',
          label: ({ orientation }) =>
            `Center ${getOrientationLabel(orientation)} spread`,
          attr: {
            min: 0.2,
            max: 5,
            step: 0.01,
            snap: '1',
          },
          displayValue: ({ centerLengthSpread }) =>
            formatFractionAsPercent(centerLengthSpread),
          defaultValue: 1,
          affectsStepCount: false,
          isStructural: true,
        },
        {
          key: 'centerWidthGap',
          type: 'range',
          label: ({ orientation }) =>
            `Center ${getOtherOrientationLabel(orientation)} gap`,
          attr: {
            min: 0,
            max: 5,
            step: 0.01,
          },
          displayValue: ({ centerWidthGap }) =>
            formatFractionAsPercent(centerWidthGap),
          defaultValue: 0,
          affectsStepCount: false,
          isStructural: true,
        },
        {
          key: 'centerLengthGap',
          type: 'range',
          label: ({ orientation }) =>
            `Center ${getOrientationLabel(orientation)} gap`,
          attr: {
            min: 0,
            max: 5,
            step: 0.01,
          },
          displayValue: ({ centerLengthGap }) =>
            formatFractionAsPercent(centerLengthGap),
          defaultValue: 0,
          affectsStepCount: false,
          isStructural: true,
        },
      ],
    },
    {
      key: 'edges',
      label: 'Edges ◅ ▻',
      type: 'group',
      show: ({ fineControl }) => fineControl,
      children: [
        {
          key: 'edgesSpread',
          type: 'range',
          label: ({ orientation }) =>
            `Edges ${getOrientationLabel(orientation)} spread`,
          attr: {
            min: 0.2,
            max: 5,
            step: 0.01,
            snap: '1',
          },
          displayValue: ({ edgesSpread }) =>
            formatFractionAsPercent(edgesSpread),
          defaultValue: 1,
          affectsStepCount: false,
          isStructural: true,
        },
        {
          key: 'edgesGap',
          type: 'range',
          label: ({ orientation }) =>
            `Edges ${getOrientationLabel(orientation)} gap`,
          attr: {
            min: 0,
            max: 1,
            step: 0.01,
            snap: '1',
          },
          displayValue: ({ edgesGap }) => formatFractionAsPercent(edgesGap),
          defaultValue: 0,
          affectsStepCount: false,
          isStructural: true,
        },
      ],
    },
    Color.getConfig({
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
      customControls: [
        {
          key: 'lockCenterColor',
          label: 'Lock center color',
          defaultValue: true,
          type: 'checkbox',
          show: ({ isMultiColor }) => isMultiColor,
          affectsNails: false,
          affectsStepCount: false,
        },
        {
          key: 'centerColor',
          type: 'color',
          label: 'Center color',
          defaultValue: '#ffd500',
          show: ({ isMultiColor, lockCenterColor }) =>
            isMultiColor && !lockCenterColor,
          affectsNails: false,
          affectsStepCount: false,
        },
      ],
      exclude: ['colorCount', 'repeatColors'],
      maxColorCount: 2,
    }),
  ];

  color: Color;

  getCalc({ size }: CalcOptions): TCalc {
    const center = this.center;
    const {
      n,
      orientation,
      margin,
      lengthGap: verticalGapPercent,
      widthGap,
      lockGap,
      fineControl,
      centerWidthGap,
      centerSpread,
      centerLengthGap: centerLengthGapPercent,
      centerLengthSpread: centerLengthSpreadPercent,
      edgesGap,
      edgesSpread,
      sidesRotation,
    } = this.config;
    const isVertical = orientation === 'v';
    let height = (isVertical ? size[1] : size[0]) - 2 * margin;
    const maxVerticalGap = (height * 0.8) / 3;
    let centerLengthGap =
      (fineControl ? centerLengthGapPercent : verticalGapPercent) *
      maxVerticalGap;
    let sideLengthGap = fineControl
      ? ((height * 0.8 - verticalGapPercent * maxVerticalGap) * edgesGap) / 2
      : verticalGapPercent * maxVerticalGap;
    const centerLengthSpread = fineControl ? centerLengthSpreadPercent : 1;
    // lineLength is for the two center vertical lines
    let lineLength =
      (height - (centerLengthGap + 2 * sideLengthGap)) /
      (2 * (fineControl ? centerLengthSpread : 1) +
        2 * (fineControl ? edgesSpread : 1));

    // sideLineLength are the two vertical lines at the edges - top and bottom
    let sideLineLength = fineControl ? lineLength * edgesSpread : lineLength;

    const orientationDimensionIndex = isVertical ? 0 : 1;

    const getBoundingRect = (): {
      top: number;
      left: number;
      right: number;
      width: number;
      centerLeft: number;
      centerRight: number;
    } => {
      const getSides = (
        widthGap: number,
        sideLength: number
      ): [number, number] => {
        return [
          center[orientationDimensionIndex] -
            widthGap * lineLength -
            sideLength,
          center[orientationDimensionIndex] +
            widthGap * lineLength +
            sideLength,
        ];
      };
      const edges = getSides(
        lockGap ? verticalGapPercent : widthGap,
        lineLength
      );
      const [centerLeft, centerRight] = fineControl
        ? getSides(centerWidthGap, centerSpread * lineLength)
        : edges;

      const [left, right] = edges;

      return {
        top:
          center[isVertical ? 1 : 0] -
          (sideLineLength +
            lineLength * centerLengthSpread +
            centerLengthGap / 2 +
            sideLengthGap),
        left,
        right,
        centerLeft,
        centerRight,
        width: Math.max(right, centerRight) - Math.min(left, centerLeft),
      };
    };

    let boundingRect = getBoundingRect();

    const sizeWidth = size[orientationDimensionIndex] - 2 * margin;
    if (boundingRect.width > sizeWidth) {
      const ratio = sizeWidth / boundingRect.width;
      height *= ratio;
      centerLengthGap *= ratio;
      lineLength *= ratio;
      boundingRect = getBoundingRect();
    }

    const { top: verticalStart, width } = boundingRect;

    const getVerticalPosition = (
      index: number
    ): { horizontal: number; vertical: number; length: number } => {
      let lineStart = verticalStart;
      if (index === 0) {
        return { vertical: lineStart, horizontal: -1, length: sideLineLength };
      }

      lineStart += sideLengthGap + sideLineLength;
      if (index === 1) {
        return {
          vertical: lineStart,
          horizontal: lineStart - sideLengthGap / 2,
          length: lineLength * centerLengthSpread,
        };
      }

      lineStart += lineLength * centerLengthSpread + centerLengthGap;
      if (index === 2) {
        return {
          vertical: lineStart,
          horizontal: lineStart - centerLengthGap / 2,
          length: lineLength * centerLengthSpread,
        };
      }

      lineStart += lineLength * centerLengthSpread + sideLengthGap;
      return {
        vertical: lineStart,
        horizontal: lineStart - sideLengthGap / 2,
        length: sideLineLength,
      };
    };

    const verticalPositions = createArray(4, getVerticalPosition);
    const verticalCenter = isVertical ? center[0] : center[1];

    const getVerticalLine = (index: number): Line => {
      const { vertical, length } = verticalPositions[index];

      const from: Coordinates = [verticalCenter, vertical];
      const to: Coordinates = [verticalCenter, vertical + length];

      if (!isVertical) {
        from.reverse();
        to.reverse();
      }

      return new Line({ from, to, n });
    };

    const verticalLines = createArray(4, getVerticalLine);

    const getRowLineRotationConfig = (
      row: number,
      index: 0 | 1
    ): Partial<LineConfig> | null => {
      if (!sidesRotation || row === 1) {
        return null;
      }

      let rotation = sidesRotation;
      if (!isVertical) {
        rotation *= -1;
      }

      if ((index === 1 && row === 0) || (index === 0 && row === 2)) {
        rotation *= -1;
      }
      return {
        rotation,
        rotationCenter: 'to',
      };
    };

    const horizontalLines = createArray(3, row => {
      const horizontalStart =
        row === 1 ? boundingRect.centerLeft : boundingRect.left;
      const horizontalEnd =
        row === 1 ? boundingRect.centerRight : boundingRect.right;

      const rowTop = verticalPositions[row + 1].horizontal;

      const sideLength =
        fineControl && row === 1 ? lineLength * centerSpread : lineLength;

      return [
        new Line({
          ...getRowLineRotationConfig(row, 0),
          ...(isVertical
            ? {
                from: [horizontalStart, rowTop],
                to: [horizontalStart + sideLength, rowTop],
                n,
              }
            : {
                from: [rowTop, horizontalStart],
                to: [rowTop, horizontalStart + sideLength],
                n,
              }),
        }),
        new Line({
          ...getRowLineRotationConfig(row, 1),
          ...(isVertical
            ? {
                from: [horizontalEnd, rowTop],
                to: [horizontalEnd - sideLength, rowTop],
                n,
              }
            : {
                from: [rowTop, horizontalEnd],
                to: [rowTop, horizontalEnd - sideLength],
                n,
              }),
        }),
      ];
    });
    return {
      verticalLines,
      horizontalLines,
      width,
      height,
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    const { colorCount } = this.config;

    this.color = new Color({
      ...this.config,
      colorCount: 2,
    });
  }

  getAspectRatio(): number {
    const { verticalLines, horizontalLines } = this.calc;
    const boundingRect = getShapesBoundingRect(
      ...verticalLines.concat(horizontalLines.flat())
    );
    return boundingRect.width / boundingRect.height;
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
    const { verticalLines } = this.calc;
    const { lockCenterColor, centerColor, isMultiColor } = this.config;

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
      let color: ColorValue;
      if (!lockCenterColor && isMultiColor) {
        const isCenter =
          (verticalIndex === 1 || verticalIndex === 2) && horizontalRow === 1;
        if (isCenter) {
          color = centerColor;
        }
      }
      if (!color) {
        color = this.color.getColor(
          horizontalRow > verticalIndex || verticalIndex - horizontalRow > 1
            ? 1
            : 0
        );
      }

      yield* this.connectLines(renderer, {
        verticalLine: verticalLines[verticalIndex],
        row: horizontalRow,
        isReverse,
        color,
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
        getNumber: sideIndex => `1_${row + 1}_${sideIndex}`,
      });
      rightLine.drawNails(this.nails, {
        getNumber: sideIndex => `2_${row + 1}_${sideIndex}`,
      });
    });
  }

  thumbnailConfig = (config: CrossesConfig) => ({
    n: Math.min(10, config.n),
  });
}
