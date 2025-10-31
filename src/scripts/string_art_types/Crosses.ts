import StringArt from '../infra/StringArt';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorValue } from '../helpers/color/color.types';
import Renderer from '../infra/renderers/Renderer';
import { ControlsConfig, GroupValue } from '../types/config.types';
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
import { PI2 } from '../helpers/math_utils';
import { getCenter } from '../helpers/size_utils';
import INails from '../infra/nails/INails';

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
  symmetricCenter: boolean;
  centerStartSpread: number;
  centerEndSpread: number;
  centerStartGap: number;
  centerEndGap: number;
  setCenterColor: boolean;
  centerColor: ColorValue;
  edges: GroupValue;
  edgesGap: number;
  edgesSpread: number;
  edgesWidthGap: number;
  edgesWidthSpread: number;
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
        {
          key: 'symmetricCenter',
          type: 'checkbox',
          label: ({ orientation }) =>
            `Symmetric ${getOtherOrientationLabel(orientation)} center`,
          defaultValue: true,
          affectsStepCount: false,
          isStructural: true,
        },
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
          show: ({ symmetricCenter }) => symmetricCenter,
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
          show: ({ symmetricCenter }) => symmetricCenter,
        },
        {
          key: 'centerStartSpread',
          type: 'range',
          label: ({ orientation }) =>
            `Center ${orientation === 'v' ? 'left' : 'up'} spread`,
          attr: {
            min: 0.2,
            max: 5,
            step: 0.01,
            snap: '1',
          },
          displayValue: ({ centerStartSpread }) =>
            formatFractionAsPercent(centerStartSpread),
          defaultValue: 1,
          affectsStepCount: false,
          isStructural: true,
          show: ({ symmetricCenter }) => !symmetricCenter,
        },
        {
          key: 'centerStartGap',
          type: 'range',
          label: ({ orientation }) =>
            `Center ${orientation === 'v' ? 'left' : 'up'} gap`,
          attr: {
            min: 0,
            max: 5,
            step: 0.01,
          },
          displayValue: ({ centerStartGap }) =>
            formatFractionAsPercent(centerStartGap),
          defaultValue: 0,
          affectsStepCount: false,
          isStructural: true,
          show: ({ symmetricCenter }) => !symmetricCenter,
        },
        {
          key: 'centerEndSpread',
          type: 'range',
          label: ({ orientation }) =>
            `Center ${orientation === 'v' ? 'right' : 'down'} spread`,
          attr: {
            min: 0.2,
            max: 5,
            step: 0.01,
            snap: '1',
          },
          displayValue: ({ centerEndSpread }) =>
            formatFractionAsPercent(centerEndSpread),
          defaultValue: 1,
          affectsStepCount: false,
          isStructural: true,
          show: ({ symmetricCenter }) => !symmetricCenter,
        },
        {
          key: 'centerEndGap',
          type: 'range',
          label: ({ orientation }) =>
            `Center ${orientation === 'v' ? 'right' : 'down'} gap`,
          attr: {
            min: 0,
            max: 5,
            step: 0.01,
          },
          displayValue: ({ centerEndGap }) =>
            formatFractionAsPercent(centerEndGap),
          defaultValue: 0,
          affectsStepCount: false,
          isStructural: true,
          show: ({ symmetricCenter }) => !symmetricCenter,
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
        {
          key: 'edgesWidthSpread',
          type: 'range',
          label: ({ orientation }) =>
            `Edges ${getOtherOrientationLabel(orientation)} spread`,
          attr: {
            min: 0.2,
            max: 5,
            step: 0.01,
            snap: '1',
          },
          displayValue: ({ edgesWidthSpread }) =>
            formatFractionAsPercent(edgesWidthSpread),
          defaultValue: 1,
          affectsStepCount: false,
          isStructural: true,
        },
        {
          key: 'edgesWidthGap',
          type: 'range',
          label: ({ orientation }) =>
            `Edges ${getOtherOrientationLabel(orientation)} gap`,
          attr: {
            min: 0,
            max: 1,
            step: 0.01,
            snap: '1',
          },
          displayValue: ({ edgesWidthGap }) =>
            formatFractionAsPercent(edgesWidthGap),
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
          key: 'setCenterColor',
          label: 'Manually set center color',
          defaultValue: false,
          type: 'checkbox',
          affectsNails: false,
          affectsStepCount: false,
        },
        {
          key: 'centerColor',
          type: 'color',
          label: 'Center color',
          defaultValue: '#ffd500',
          show: ({ setCenterColor }) => setCenterColor,
          affectsNails: false,
          affectsStepCount: false,
        },
      ],
      exclude: ['repeatColors'],
      maxColorCount: 2,
    }),
  ];

  color: Color;

  getCalc({ size }: CalcOptions): TCalc {
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
      symmetricCenter,
      centerLengthGap: centerLengthGapPercent,
      centerLengthSpread: centerLengthSpreadPercent,
      centerStartGap,
      centerStartSpread,
      centerEndGap,
      centerEndSpread,
      edgesGap,
      edgesSpread,
      edgesWidthGap,
      edgesWidthSpread,
      sidesRotation,
    } = this.config;
    const center = getCenter(size);

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

    let widthShift = 0;

    // sideLineLength are the two vertical lines at the edges - top and bottom
    let sideLineLength = fineControl ? lineLength * edgesSpread : lineLength;

    const orientationDimensionIndex = isVertical ? 0 : 1;

    function getBoundingRect(): {
      lengthStart: number;
      edgesWidthStart: number;
      edgesWidthEnd: number;
      width: number;
      centerStart: number;
      centerEnd: number;
      widthStart: number;
      widthEnd: number;
      height: number;
      heightStart: number;
    } {
      const getSides = (
        widthGap: number,
        sideLength: number,
        overrides?: Partial<{
          gap1: number;
          gap2: number;
          length1: number;
          length2: number;
        }>
      ): [number, number] => {
        return [
          center[orientationDimensionIndex] -
            (overrides?.gap1 ?? widthGap) * lineLength -
            (overrides?.length1 ?? sideLength) +
            widthShift,
          center[orientationDimensionIndex] +
            (overrides?.gap2 ?? widthGap) * lineLength +
            (overrides?.length2 ?? sideLength) +
            widthShift,
        ];
      };
      const edges = fineControl
        ? null
        : getSides(lockGap ? verticalGapPercent : widthGap, lineLength);

      const [centerStart, centerEnd] = fineControl
        ? getSides(
            centerWidthGap,
            centerSpread * lineLength,
            symmetricCenter
              ? undefined
              : {
                  gap1: centerStartGap,
                  gap2: centerEndGap,
                  length1: centerStartSpread * lineLength,
                  length2: centerEndSpread * lineLength,
                }
          )
        : edges;

      const [edgesWidthStart, edgesWidthEnd] = fineControl
        ? getSides(edgesWidthGap, edgesWidthSpread * lineLength)
        : edges;

      const [rotatedEdgesWidthStart, rotatedEdgesWidthEnd] = getSides(
        edgesWidthGap,
        Math.cos(sidesRotation * PI2) *
          (fineControl ? edgesWidthSpread : 1) *
          lineLength
      );

      const length =
        2 * (sideLineLength + lineLength * centerLengthSpread + sideLengthGap) +
        centerLengthGap;

      const lengthStart = center[isVertical ? 1 : 0] - length / 2;

      const distanceToFirstEdge =
        centerLengthGap / 2 +
        lineLength * centerLengthSpread +
        sideLengthGap / 2 +
        Math.sin(sidesRotation * PI2) * lineLength * edgesWidthSpread;

      const [rotatedEdgesLegthStart, rotatedEdgesLengthEnd] = [
        center[isVertical ? 1 : 0] - distanceToFirstEdge,
        center[isVertical ? 1 : 0] + distanceToFirstEdge,
      ];

      const widthStart = Math.min(rotatedEdgesWidthStart, centerStart);
      const widthEnd = Math.max(rotatedEdgesWidthEnd, centerEnd);

      const heightStart = Math.min(lengthStart, rotatedEdgesLegthStart);
      const heightEnd = Math.max(lengthStart + length, rotatedEdgesLengthEnd);

      return {
        lengthStart,
        edgesWidthStart,
        edgesWidthEnd,
        centerStart,
        centerEnd,
        width: widthEnd - widthStart,
        widthStart,
        widthEnd,
        heightStart,
        height: heightEnd - heightStart,
      };
    }

    let boundingRect = getBoundingRect();

    const sizeWithoutMargins = size.map(v => v - 2 * margin);
    const sizeWidth = sizeWithoutMargins[orientationDimensionIndex];
    const sizeHeight = sizeWithoutMargins[isVertical ? 1 : 0];

    const sizeRatio = Math.min(
      sizeWidth / boundingRect.width,
      sizeHeight / boundingRect.height
    );

    const centeredWidthStart =
      center[orientationDimensionIndex] - boundingRect.width / 2;
    let shouldRefreshBoundingRect = false;
    const newWidthShift =
      Math.trunc(centeredWidthStart) - Math.trunc(boundingRect.widthStart);
    if (newWidthShift !== widthShift) {
      widthShift = newWidthShift;
      shouldRefreshBoundingRect = true;
    }

    if (sizeRatio < 1) {
      height *= sizeRatio;
      centerLengthGap *= sizeRatio;
      lineLength *= sizeRatio;
      widthShift *= sizeRatio;
      sideLineLength *= sizeRatio;
      shouldRefreshBoundingRect = true;
      sideLengthGap *= sizeRatio;
    }

    if (shouldRefreshBoundingRect) {
      boundingRect = getBoundingRect();
    }

    const { lengthStart, width } = boundingRect;

    function getVerticalPosition(index: number): {
      horizontal: number;
      vertical: number;
      length: number;
    } {
      let lineStart = lengthStart;
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
    }

    const verticalPositions = createArray(4, getVerticalPosition);
    const verticalCenter = (isVertical ? center[0] : center[1]) + widthShift;

    function getVerticalLine(index: number): Line {
      const { vertical, length } = verticalPositions[index];

      const from: Coordinates = [verticalCenter, vertical];
      const to: Coordinates = [verticalCenter, vertical + length];

      if (!isVertical) {
        from.reverse();
        to.reverse();
      }

      return new Line({ from, to, n });
    }

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

    function getHorizontalLineLength(row: number, index: number): number {
      if (!fineControl) {
        return lineLength;
      }

      if (row === 1) {
        if (symmetricCenter) {
          return lineLength * centerSpread;
        }

        return lineLength * (index === 0 ? centerStartSpread : centerEndSpread);
      }

      return lineLength * edgesWidthSpread;
    }

    const horizontalLines = createArray(3, row => {
      const horizontalStart =
        row === 1 ? boundingRect.centerStart : boundingRect.edgesWidthStart;
      const horizontalEnd =
        row === 1 ? boundingRect.centerEnd : boundingRect.edgesWidthEnd;

      const rowTop = verticalPositions[row + 1].horizontal;

      // In case of fine control and non-symmetric center, the center width lines (potentially) have different sizes
      const startLength = getHorizontalLineLength(row, 0);
      const endLength = getHorizontalLineLength(row, 1);

      return [
        new Line({
          ...getRowLineRotationConfig(row, 0),
          ...(isVertical
            ? {
                from: [horizontalStart, rowTop],
                to: [horizontalStart + startLength, rowTop],
                n,
              }
            : {
                from: [rowTop, horizontalStart],
                to: [rowTop, horizontalStart + startLength],
                n,
              }),
        }),
        new Line({
          ...getRowLineRotationConfig(row, 1),
          ...(isVertical
            ? {
                from: [horizontalEnd, rowTop],
                to: [horizontalEnd - endLength, rowTop],
                n,
              }
            : {
                from: [rowTop, horizontalEnd],
                to: [rowTop, horizontalEnd - endLength],
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

    this.color = new Color(this.config);
  }

  getAspectRatio(): number {
    const { verticalLines, horizontalLines } =
      this.calc ?? this.getCalc({ size: [100, 100] });
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
    const { setCenterColor, centerColor, isMultiColor } = this.config;

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
      if (setCenterColor) {
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

  getNailCount(): number {
    return this.config.n * 10;
  }

  drawNails(nails: INails) {
    this.calc.verticalLines.forEach((line, i) =>
      line.drawNails(nails, { uniqueKey: String.fromCharCode(65 + i) })
    );

    this.calc.horizontalLines.forEach(([startLine, endLine], row) => {
      startLine.drawNails(nails, { uniqueKey: row * 10 });
      endLine.drawNails(nails, { uniqueKey: row * 10 + 1 });
    });
  }

  thumbnailConfig = (config: CrossesConfig) => ({
    n: Math.min(10, config.n),
  });
}
