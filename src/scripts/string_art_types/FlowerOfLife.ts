import { PI2 } from '../helpers/math_utils';
import StringArt from '../infra/StringArt';
import Color from '../helpers/color/Color';
import Polygon from '../shapes/Polygon';
import Circle from '../shapes/Circle';
import { formatFractionAsPercent } from '../helpers/string_utils';
import {
  ColorConfig,
  ColorMap,
  ColorValue,
} from '../helpers/color/color.types';
import { ControlsConfig, GroupValue } from '../types/config.types';
import { Coordinates } from '../types/general.types';
import Renderer from '../infra/renderers/Renderer';
import { CalcOptions } from '../types/stringart.types';
import { getCenter } from '../helpers/size_utils';
import { createArray } from '../helpers/array_utils';
import INails from '../infra/nails/INails';
import NailsGroup from '../infra/nails/NailsGroup';

interface FlowerOfLifeConfig extends ColorConfig {
  levels: number;
  density: number;
  globalRotation: number;
  fillGroup: GroupValue;
  fill: boolean;
  fillColor: ColorValue;
  ringGroup: GroupValue;
  renderRing: boolean;
  ringSize: number;
  ringNailCount: number;
  ringPadding: number;
  ringColor: ColorValue;
  renderTriangles: boolean;
  renderCaps: boolean;
  colorPerLevel: boolean;
}

interface TCalc {
  edgeSize: number;
  triangleHeight: number;
  nailsLength: number;
  triangleCenterDistance: number;
  nailDistance: number;
  triangleCount: number;
  countPerLevelSide: number[];
  globalRotationRadians: number;
  radius: number;
  ringCircle: Circle;
  center: Coordinates;
  nailsGroup: NailsGroup;
}

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#29f1ff',
    multicolorRange: 30,
    multicolorStart: 25,
    multicolorByLightness: true,
    minLightness: 40,
    maxLightness: 95,
    colorCount: 3,
    repeatColors: true,
    saturation: 83,
    reverseColors: true,
  },
  customControls: [
    {
      key: 'colorPerLevel',
      label: 'Color per level',
      defaultValue: true,
      type: 'checkbox',
      affectsNails: false,
    },
  ],
});

const ANGLE = -PI2 / 6; // The angle of a equilateral triangle;
const SIDE_ANGLES = new Array(6)
  .fill(null)
  .map((_, i) => Math.PI / 2 + ANGLE * i);

export default class FlowerOfLife extends StringArt<FlowerOfLifeConfig, TCalc> {
  static type = 'flower_of_life';

  name = 'Flower of Life';
  id = 'flower_of_life';
  link =
    'https://www.reddit.com/r/psychedelicartwork/comments/mk97gi/rainbow_flower_of_life_uv_reactive_string_art/';
  controls: ControlsConfig<FlowerOfLifeConfig> = [
    {
      key: 'levels',
      label: 'Levels',
      defaultValue: 3,
      type: 'range',
      attr: {
        min: 1,
        max: 10,
        step: 1,
      },
      isStructural: true,
    },
    {
      key: 'density',
      label: 'Density',
      defaultValue: 10,
      type: 'range',
      attr: {
        min: 1,

        max: 50,
        step: 1,
      },
      isStructural: true,
    },
    {
      key: 'globalRotation',
      label: 'Rotation',
      defaultValue: 0,
      type: 'range',
      attr: {
        min: 0,
        max: 30,
        step: 1,
      },
      displayValue: ({ globalRotation }) => `${globalRotation}°`,
      isStructural: true,
      affectsStepCount: false,
    },
    {
      key: 'fillGroup',
      label: 'Fill',
      type: 'group',
      children: [
        {
          key: 'fill',
          label: 'Show fill',
          defaultValue: true,
          type: 'checkbox',
          isStructural: true,
          affectsNails: false,
        },
        {
          key: 'fillColor',
          label: 'Fill color',
          defaultValue: '#292e29',
          type: 'color',
          show: ({ fill }) => fill,
          affectsNails: false,
        },
      ],
    },
    {
      key: 'ringGroup',
      label: 'Ring',
      type: 'group',
      children: [
        {
          key: 'renderRing',
          label: 'Show outer ring',
          type: 'checkbox',
          defaultValue: true,
          isStructural: true,
        },
        {
          key: 'ringNailCount',
          label: 'Ring nail count',
          defaultValue: 144,
          type: 'range',
          attr: {
            min: 3,
            max: 360,
            step: 1,
          },
          show: ({ renderRing }) => renderRing,
          isStructural: true,
        },
        {
          key: 'ringSize',
          label: 'Outer ring size',
          defaultValue: 0.23,
          type: 'range',
          attr: {
            min: 0,
            max: 0.5,
            step: 0.01,
          },
          show: ({ renderRing }) => renderRing,
          displayValue: ({ ringSize }) => formatFractionAsPercent(ringSize),
          isStructural: true,
        },
        {
          key: 'ringPadding',
          label: 'Ring padding',
          defaultValue: 0.06,
          type: 'range',
          attr: {
            min: 0,
            max: 0.5,
            step: 0.01,
          },
          show: ({ renderRing }) => renderRing,
          isStructural: true,
          displayValue: ({ ringPadding }) =>
            formatFractionAsPercent(ringPadding),
        },
        {
          key: 'ringColor',
          label: 'Ring color',
          defaultValue: '#e8b564',
          type: 'color',
          show: ({ renderRing }) => renderRing,
          affectsNails: false,
        },
      ],
    },
    {
      key: 'renderTriangles',
      label: 'Show triangles',
      defaultValue: true,
      type: 'checkbox',
      isStructural: true,
      affectsNails: false,
    },
    {
      key: 'renderCaps',
      label: 'Show caps',
      defaultValue: true,
      type: 'checkbox',
      show: ({ renderTriangles }) => renderTriangles,
      isStructural: true,
    },
    COLOR_CONFIG,
  ];

  defaultValues = {
    nailsColor: '#474747',
  };

  color: Color;
  colorMap: ColorMap;

  getCalc(options: CalcOptions): TCalc {
    const { size } = options;
    const {
      levels,
      density,
      margin,
      globalRotation,
      renderCaps,
      renderRing,
      ringNailCount,
      ringSize,
      ringPadding,
    } = this.config;
    const globalRotationRadians =
      (globalRotation * Math.PI) / 180 + Math.PI / 6;

    const radius = renderRing
      ? Math.min(...size.map(v => v / 2 - margin))
      : null;
    const ringDistance = renderRing
      ? Math.floor((ringSize * ringNailCount) / 2)
      : 0; // The number of nails to count for strings in the outer ring
    const ringWidth = renderRing
      ? radius * (1 - Math.cos((PI2 * (ringDistance / ringNailCount)) / 2))
      : 0;

    const polygon = new Polygon({
      sides: 6,
      size,
      margin:
        margin +
        ringWidth +
        (renderRing && ringSize ? ringPadding * radius : 0),
      rotation: globalRotationRadians,
      fitSize: false,
      nailsPerSide: 2,
    });

    const edgeSize = polygon.sideSize / levels;
    const nailsLength = edgeSize / (2 * Math.cos(Math.PI / 6));

    const ringCircle =
      renderRing && ringSize
        ? new Circle({
            size,
            n: ringNailCount,
            margin: margin,
            rotation: globalRotation,
          })
        : null;

    const countPerLevelSide = new Array(levels + (renderCaps ? 1 : 0))
      .fill(null)
      .map((_, level) => level * 2 + 1);

    const calc = {
      edgeSize,
      triangleHeight: (edgeSize * Math.sqrt(3)) / 2,
      nailsLength,
      triangleCenterDistance: edgeSize / 2,
      nailDistance: nailsLength / density,
      triangleCount: 6 * levels ** 2,
      countPerLevelSide,
      globalRotationRadians,
      radius,
      ringCircle,
      center: getCenter(size),
    };

    return {
      ...calc,
      ...this.#getPoints(calc),
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);

    const {
      isMultiColor,
      levels,
      colorPerLevel,
      colorCount,
      renderRing,
      ringSize,
      ringNailCount,
      ...config
    } = this.config;

    if (!this.stepCount) {
      this.stepCount = this.getStepCount(options);
    }

    const realColorCount = isMultiColor
      ? colorPerLevel
        ? levels
        : Math.min(colorCount, levels)
      : 1;

    this.color = new Color({
      ...config,
      isMultiColor,
      colorCount: realColorCount,
    });

    if (isMultiColor) {
      this.colorMap = this.color.getColorMap({
        stepCount: realColorCount,
        colorCount: realColorCount,
      });
    } else {
      this.colorMap = null;
    }
  }

  getAspectRatio(): number {
    return 1;
  }

  #getTrianglePoints(
    calc: Omit<TCalc, 'nailsGroup'>,
    {
      center,
      rotation,
      isCapLevel,
      triangleIndexInSide,
      withPoint,
    }: {
      center: Coordinates;
      rotation: number;
      isCapLevel: boolean;
      triangleIndexInSide: number;
      withPoint: (side: number, index: number, point: Coordinates) => void;
    }
  ): Coordinates[][] {
    let missingSide: number;
    if (isCapLevel) {
      const triangleIndex = (triangleIndexInSide + 2) % 3;
      missingSide = this.#getNextIndexInTriangle(triangleIndex);
    }

    // For each side of the triangle, the first point is the center of the triangle:
    const trianglePoints = new Array(3)
      .fill(null)
      .map((_, i) => (i === missingSide ? [] : [center]));

    withPoint(0, 0, center);
    for (let side = 0; side < 3; side++) {
      if (isCapLevel && side === missingSide) {
        continue;
      }
      const sideAngle = rotation + side * (PI2 / 3);
      const triangleSidePoints = trianglePoints[side];

      const cosSideAngle = Math.cos(sideAngle);
      const sinSideAngle = Math.sin(sideAngle);

      for (let n = 1; n <= this.config.density; n++) {
        const nNailDistance = n * calc.nailDistance;

        const point: Coordinates = [
          center[0] + nNailDistance * cosSideAngle,
          center[1] + nNailDistance * sinSideAngle,
        ];
        triangleSidePoints.push(point);
        withPoint(side, n, point);
      }
    }

    return trianglePoints;
  }

  #getPoints(calc: Omit<TCalc, 'nailsGroup'>): {
    nailsGroup: NailsGroup;
  } {
    const { levels, renderCaps } = this.config;

    const largeDistance = calc.nailsLength;
    const smallDistance = calc.triangleHeight - largeDistance;
    const nailsGroup = new NailsGroup();
    const levelsCount = renderCaps ? levels + 1 : levels;

    for (let level = 0; level < levelsCount; level++) {
      const isCapLevel = renderCaps && level === levels;

      const levelSideTriangleCount = calc.countPerLevelSide[level];

      // Caching distances to avoid repeated calculations for each side:
      const levelPositions = createArray(levelSideTriangleCount, n => {
        const isFlipped = n % 2 === 0;
        const trianglePosition = [
          calc.triangleCenterDistance * (n - level),
          level * calc.triangleHeight +
            (isFlipped ? largeDistance : smallDistance),
        ];

        return {
          rotation: Math.atan(trianglePosition[0] / trianglePosition[1]),
          distanceFromCenter: Math.hypot(
            trianglePosition[0],
            trianglePosition[1]
          ),
        };
      });

      let triangleIndexInLevel = 0;

      for (let side = 0; side < 6; side++) {
        const sideRotation = SIDE_ANGLES[side];

        for (let n = 0; n < levelSideTriangleCount; n++) {
          if (isCapLevel && n % 2 === 0) {
            // Cap triangles are only odd indexes
            triangleIndexInLevel++;
            continue;
          }

          const { distanceFromCenter, rotation } = levelPositions[n];

          const triangleCenterAngle =
            sideRotation - rotation - calc.globalRotationRadians;

          const rotatedTrianglePosition = [
            calc.center[0] + distanceFromCenter * Math.cos(triangleCenterAngle),
            calc.center[1] - distanceFromCenter * Math.sin(triangleCenterAngle),
          ] as Coordinates;

          this.#getTrianglePoints(calc, {
            center: rotatedTrianglePosition,
            rotation:
              sideRotation +
              (side * PI2) / 3 -
              n * ANGLE +
              calc.globalRotationRadians,
            isCapLevel,
            triangleIndexInSide: n,
            withPoint: (side, index, point) => {
              nailsGroup.addNail(
                this.#getPointKey(level, triangleIndexInLevel, side, index),
                point
              );
            },
          });

          triangleIndexInLevel++;
        }
      }
    }

    return { nailsGroup };
  }

  *generateTriangleStrings(
    renderer: Renderer,
    {
      level,
      indexInSide,
      triangleIndex,
      isCapLevel,
    }: {
      level: number;
      triangleIndex: number;
      indexInSide: number;
      isCapLevel: boolean;
    }
  ): Generator<void> {
    renderer.setColor(this.color.getColor(level));
    const { density } = this.config;

    const initialSide = isCapLevel
      ? this.#getNextIndexInTriangle(indexInSide % 3)
      : 0;
    const lastSide = isCapLevel ? initialSide : 2;
    const lastIndex = isCapLevel ? density : density - 1;

    for (let side = initialSide; side <= lastSide; side++) {
      const nextSide = this.#getNextIndexInTriangle(side, 1);
      let prevPoint = this.calc.nailsGroup.getNailCoordinates(
        this.#getPointKey(level, triangleIndex, 0, 0)
      );

      for (let n = 0; n <= lastIndex; n++) {
        const isNextSide = n % 2 === 0;

        const nextSidePoint = isNextSide ? density - n : n;
        const targetSide = isNextSide ? nextSide : side;
        const targetPoint = this.calc.nailsGroup.getNailCoordinates(
          this.#getPointKey(level, triangleIndex, targetSide, nextSidePoint)
        );

        renderer.renderLine(prevPoint, targetPoint);
        yield;

        if (n < density) {
          prevPoint = this.calc.nailsGroup.getNailCoordinates(
            this.#getPointKey(
              level,
              triangleIndex,
              targetSide,
              isNextSide ? nextSidePoint - 1 : nextSidePoint + 1
            )
          );
          renderer.renderLine(targetPoint, prevPoint);
          yield;
        }
      }
    }
  }

  *generateStringsBetweenTriangles(
    renderer: Renderer,
    {
      triangle1Index,
      triangle2Index,
      triangle1Level,
      triangle2Level,
      triangleIndexInSide,
      isNextLevel,
    }: {
      triangle1Index: number;
      triangle2Index: number;
      triangle1Level: number;
      triangle2Level: number;
      triangleIndexInSide: number;
      isNextLevel?: boolean;
    }
  ): Generator<void> {
    const { density, fillColor } = this.config;
    const levelSideCount = this.calc.countPerLevelSide[triangle1Level];
    const angleShift = (triangle1Index % levelSideCount) % 3;

    renderer.setColor(fillColor);

    const isLastTriangleInSide = triangleIndexInSide === levelSideCount - 1;
    const firstSide = angleShift;

    const sideIndex: [number, number] = isNextLevel
      ? [
          this.#getNextIndexInTriangle(angleShift),
          this.#getNextIndexInTriangle(angleShift, -1),
        ]
      : [
          firstSide,
          this.#getNextIndexInTriangle(
            firstSide,
            triangleIndexInSide % 2 ? 1 : -1
          ),
        ];

    for (let s = 0; s < 2; s++) {
      const order = generateOrderInSide.call(this, s);

      for (const { pointIndex, triangle1Side, triangle2Side } of order) {
        renderer.renderLine(
          this.calc.nailsGroup.getNailCoordinates(
            this.#getPointKey(
              triangle1Level,
              triangle1Index,
              triangle1Side,
              pointIndex
            )
          ),
          this.calc.nailsGroup.getNailCoordinates(
            this.#getPointKey(
              triangle2Level,
              triangle2Index,
              triangle2Side,
              pointIndex
            )
          )
        );

        yield;
      }
    }

    function* generateOrderInSide(side: number): Generator<{
      pointIndex: number;
      triangle1Side: number;
      triangle2Side: number;
    }> {
      const triangle1Side = sideIndex[side];
      const triangle2Side = getNextTriangleSide.call(this);

      const last = side ? density : density - 1;

      if (side === 0) {
        for (let n = 0; n <= last; n++) {
          yield { pointIndex: density - n, triangle1Side, triangle2Side };
        }
      } else {
        for (let n = last; n >= 1; n--) {
          yield { pointIndex: density - n, triangle1Side, triangle2Side };
        }
      }

      function getNextTriangleSide() {
        if (isNextLevel) {
          return this.#getNextIndexInTriangle(triangle1Side);
        } else {
          if (side === 0 && isLastTriangleInSide) {
            return 1;
          } else {
            if (side === 1 && isLastTriangleInSide) {
              return 0;
            } else {
              return this.#getNextIndexInTriangle(triangle1Side, 1);
            }
          }
        }
      }
    }
  }

  #getNextIndexInTriangle(index: number, direction: 1 | -1 = 1): number {
    const result = index + direction;

    if (result < 0) {
      return 2;
    }
    if (result > 2) {
      return 0;
    }
    return result;
  }

  *drawStrings(renderer: Renderer): Generator<void> {
    const {
      fill,
      renderTriangles,
      renderCaps,
      levels,
      renderRing,
      ringSize,
      ringColor,
    } = this.config;

    const levelsCount = renderCaps ? levels + 1 : levels;

    for (let levelIndex = 0; levelIndex < levelsCount; levelIndex++) {
      const isCapLevel = levelIndex === levels;

      const levelTriangleCount = 6 * (levelIndex * 2 + 1);
      const lastIndexInLevel = levelTriangleCount - 1;

      for (
        let triangleIndex = 0;
        triangleIndex < levelTriangleCount;
        triangleIndex++
      ) {
        const levelSideCount = this.calc.countPerLevelSide[levelIndex];
        const triangleIndexInSide = triangleIndex % levelSideCount;

        if (fill && !isCapLevel) {
          if (triangleIndex === 0) {
            yield* this.generateStringsBetweenTriangles(renderer, {
              triangle1Index: lastIndexInLevel,
              triangle2Index: triangleIndex,
              triangle1Level: levelIndex,
              triangle2Level: levelIndex,
              triangleIndexInSide: lastIndexInLevel % levelSideCount,
            });
          }
          if (triangleIndex !== lastIndexInLevel) {
            yield* this.generateStringsBetweenTriangles(renderer, {
              triangle1Index: triangleIndex,
              triangle2Index: triangleIndex + 1,
              triangle1Level: levelIndex,
              triangle2Level: levelIndex,
              triangleIndexInSide,
            });
          }

          if (
            triangleIndexInSide % 2 === 0 &&
            ((renderCaps && renderTriangles) || levelIndex < levels - 1)
          ) {
            const side = Math.floor(triangleIndex / levelSideCount);
            const nextLevelSideCount =
              this.calc.countPerLevelSide[levelIndex + 1];
            const nextLevelTriangleIndex =
              side * nextLevelSideCount + triangleIndexInSide + 1;

            yield* this.generateStringsBetweenTriangles(renderer, {
              triangle1Index: triangleIndex,
              triangle2Index: nextLevelTriangleIndex,
              triangle1Level: levelIndex,
              triangle2Level: levelIndex + 1,
              triangleIndexInSide,
              isNextLevel: true,
            });
          }
        }

        if (renderTriangles && (!isCapLevel || triangleIndexInSide % 2)) {
          yield* this.generateTriangleStrings(renderer, {
            level: levelIndex,
            indexInSide: triangleIndexInSide,
            triangleIndex,
            isCapLevel,
          });
        }
      }
    }

    if (renderRing && ringSize) {
      yield* this.calc.ringCircle.drawRing(renderer, {
        ringSize: ringSize / 2,
        color: ringColor,
      });
    }
  }

  getStepCount(options: CalcOptions): number {
    if (this.stepCount) {
      return this.stepCount;
    }

    const calc = this.calc ?? this.getCalc(options);

    const { density, renderTriangles, renderCaps, levels, fill } = this.config;
    const { triangleCount, ringCircle } = calc;

    const capCount = renderTriangles && renderCaps ? levels * 6 : 0;

    // First we count how many fills there are. The calculation is like this:
    // For each level, there's a fill between each triangle
    // Also, for each level, there are (level - 1) * 6 fills, where the level is zero-based (the first level is 0)
    // Finally, if there are caps, each cap has a fill
    let fillCount = 0;
    if (fill) {
      const getTriangleCountForLevel = (level: number) => 6 * (level * 2 + 1);

      for (let level = 0; level < levels; level++) {
        const levelTrianglecount = getTriangleCountForLevel(level);
        fillCount += levelTrianglecount + level * 6;
      }

      fillCount += capCount;
    }

    const fillStepCount = fillCount * density * 2;
    const capSteps = capCount * (2 * density + 1);

    return (
      (renderTriangles ? triangleCount * density * 6 : 0) +
      capSteps +
      fillStepCount +
      (ringCircle ? ringCircle.getRingStepCount() : 0)
    );
  }

  getNailCount(): number {
    return (
      this.#getTrianglesNailsCount() +
      (this.config.renderRing ? this.config.ringNailCount : 0)
    );
  }

  #getTrianglesNailsCount(): number {
    const { levels, renderCaps, density } = this.config;

    const triangleCount = 6 * levels ** 2;
    const capsCount = renderCaps ? levels * 6 : 0;
    // jointsCount is the number of joints that are shared by multiple triangles, not counting the center joint
    const jointsCount = ((levels * (levels + 1)) / 2) * 6 + 1;
    const nailsPerTriangleWithoutJoints = (density - 1) * 3 + 1;
    const capsNailCount = capsCount * ((density - 1) * 2 + 1);
    return (
      triangleCount * nailsPerTriangleWithoutJoints +
      jointsCount +
      capsNailCount
    );
  }

  drawNails(nails: INails) {
    nails.addGroup(this.calc.nailsGroup);

    if (this.calc.ringCircle) {
      this.calc.ringCircle.drawNails(nails);
    }
  }

  #getPointKey(
    level: number,
    triangle: number,
    side: number,
    index: number
  ): string | number {
    return index
      ? 1e6 * level + 1e3 * triangle + side * 1e2 + index
      : 1e6 * level + 1e3 * triangle;
  }

  thumbnailConfig = ({ density }) => ({
    density: Math.min(density, 3),
  });
}
