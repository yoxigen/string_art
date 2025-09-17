import { PI2 } from '../helpers/math_utils';
import StringArt from '../StringArt';
import Color from '../helpers/color/Color';
import Polygon from '../shapes/Polygon';
import Circle, { CircleConfig } from '../shapes/Circle';
import { formatFractionAsPercent } from '../helpers/string_utils';
import {
  ColorConfig,
  ColorMap,
  ColorValue,
} from '../helpers/color/color.types';
import { ControlsConfig, GroupValue } from '../types/config.types';
import { Coordinates } from '../types/general.types';
import Renderer from '../renderers/Renderer';
import { CalcOptions } from '../types/stringart.types';

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

type Points = Coordinates[][][][];

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

  points: Points;
  color: Color;
  colorMap: ColorMap;
  #circle: Circle;

  getCalc({ size }: CalcOptions): TCalc {
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
      nailsSpacing: 2,
    });

    const edgeSize = polygon.sideSize / levels;
    const nailsLength = edgeSize / (2 * Math.cos(Math.PI / 6));

    const countPerLevelSide = new Array(levels + (renderCaps ? 1 : 0))
      .fill(null)
      .map((_, level) => level * 2 + 1);

    return {
      edgeSize,
      triangleHeight: (edgeSize * Math.sqrt(3)) / 2,
      nailsLength,
      triangleCenterDistance: edgeSize / 2,
      nailDistance: nailsLength / density,
      triangleCount: 6 * levels ** 2,
      countPerLevelSide,
      globalRotationRadians,
      radius,
    };
  }

  resetStructure() {
    super.resetStructure();

    this.points = null;
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

    if (renderRing && ringSize) {
      const circleConfig: CircleConfig = {
        size: options.size,
        n: ringNailCount,
        margin: config.margin,
        rotation: config.globalRotation,
      };

      if (this.#circle) {
        this.#circle.setConfig(circleConfig);
      } else {
        this.#circle = new Circle(circleConfig);
      }
    } else {
      this.#circle = null;
    }

    if (!this.points) {
      this.points = this.getPoints();
    }

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

  getTrianglePoints({
    center,
    rotation,
    isCapLevel,
    triangleIndexInSide,
  }: {
    center: Coordinates;
    rotation: number;
    isCapLevel: boolean;
    triangleIndexInSide: number;
  }): Coordinates[][] {
    let missingSide: number;
    if (isCapLevel) {
      const triangleIndex = (triangleIndexInSide + 2) % 3;
      missingSide = this.#getNextIndexInTriangle(triangleIndex);
    }

    // For each side of the triangle, the first point is the center of the triangle:
    const trianglePoints = new Array(3)
      .fill(null)
      .map((_, i) => (i === missingSide ? [] : [center]));

    for (let side = 0; side < 3; side++) {
      if (isCapLevel && side === missingSide) {
        continue;
      }
      const sideAngle = rotation + side * (PI2 / 3);
      const triangleSidePoints = trianglePoints[side];

      const cosSideAngle = Math.cos(sideAngle);
      const sinSideAngle = Math.sin(sideAngle);

      for (let n = 1; n <= this.config.density; n++) {
        const nNailDistance = n * this.calc.nailDistance;

        triangleSidePoints.push([
          center[0] + nNailDistance * cosSideAngle,
          center[1] + nNailDistance * sinSideAngle,
        ]);
      }
    }

    return trianglePoints;
  }

  getPoints(): Points {
    if (this.points) {
      return this.points;
    }

    const { levels, renderCaps } = this.config;

    const largeDistance = this.calc.nailsLength;
    const smallDistance = this.calc.triangleHeight - largeDistance;
    const levelsPoints: Points = [];

    const levelsCount = renderCaps ? levels + 1 : levels;

    for (let level = 0; level < levelsCount; level++) {
      const isCapLevel = renderCaps && level === levels;

      const levelTrianglesPoints: Coordinates[][][] = [];
      levelsPoints.push(levelTrianglesPoints);

      const levelSideTriangleCount = this.calc.countPerLevelSide[level];

      // Caching distances to avoid repeated calculations for each side:
      const levelPositions = new Array(levelSideTriangleCount)
        .fill(null)
        .map((_, n) => {
          const isFlipped = n % 2 === 0;
          const trianglePosition = [
            this.calc.triangleCenterDistance * (n - level),
            level * this.calc.triangleHeight +
              (isFlipped ? largeDistance : smallDistance),
          ];

          return {
            rotation: Math.atan(trianglePosition[0] / trianglePosition[1]),
            distanceFromCenter: Math.sqrt(
              trianglePosition[0] ** 2 + trianglePosition[1] ** 2
            ),
          };
        });

      for (let side = 0; side < 6; side++) {
        const sideRotation = SIDE_ANGLES[side];

        for (let n = 0; n < levelSideTriangleCount; n++) {
          if (isCapLevel && n % 2 === 0) {
            // Cap triangles are only odd indexes
            levelTrianglesPoints.push(null);
            continue;
          }

          const { distanceFromCenter, rotation } = levelPositions[n];

          const triangleCenterAngle =
            sideRotation - rotation - this.calc.globalRotationRadians;

          const rotatedTrianglePosition = [
            this.center[0] + distanceFromCenter * Math.cos(triangleCenterAngle),
            this.center[1] - distanceFromCenter * Math.sin(triangleCenterAngle),
          ] as Coordinates;

          const trianglePoints = this.getTrianglePoints({
            center: rotatedTrianglePosition,
            rotation:
              sideRotation +
              (side * PI2) / 3 -
              n * ANGLE +
              this.calc.globalRotationRadians,
            isCapLevel,
            triangleIndexInSide: n,
          });

          levelTrianglesPoints.push(trianglePoints);
        }
      }
    }

    return levelsPoints;
  }

  *generateTriangleStrings(
    renderer: Renderer,
    {
      points,
      level,
      indexInSide,
    }: {
      points: Coordinates[][];
      level: number;
      indexInSide: number;
    }
  ): Generator<void> {
    renderer.setColor(this.color.getColor(level));
    const { density, levels } = this.config;
    const isCapLevel = level === levels;

    const initialSide = isCapLevel
      ? this.#getNextIndexInTriangle(indexInSide % 3)
      : 0;
    const lastSide = isCapLevel ? initialSide : 2;
    const lastIndex = isCapLevel ? density : density - 1;

    for (let side = initialSide; side <= lastSide; side++) {
      const nextSide = this.#getNextIndexInTriangle(side);
      let prevPoint = points[side][0];

      for (let n = 0; n <= lastIndex; n++) {
        const isNextSide = n % 2 === 0;

        const nextSidePoint = isNextSide ? this.config.density - n : n;
        const targetSide = isNextSide ? nextSide : side;
        const targetPoint = points[targetSide][nextSidePoint];
        renderer.renderLine(prevPoint, targetPoint);
        yield;

        if (n < density) {
          prevPoint =
            points[targetSide][
              isNextSide ? nextSidePoint - 1 : nextSidePoint + 1
            ];
          renderer.renderLine(targetPoint, prevPoint);
          yield;
        }
      }
    }
  }

  *generateStringsBetweenTriangles(
    renderer: Renderer,
    {
      triangle1,
      triangle2,
      level,
      triangleIndex,
      triangleIndexInSide,
      isNextLevel,
    }: {
      triangle1: Coordinates[][];
      triangle2: Coordinates[][];
      level: number;
      triangleIndex: number;
      triangleIndexInSide: number;
      isNextLevel?: boolean;
    }
  ): Generator<void> {
    const { density, fillColor } = this.config;
    const levelSideCount = this.calc.countPerLevelSide[level];
    const angleShift = (triangleIndex % levelSideCount) % 3;

    renderer.setColor(fillColor);

    const isLastTriangleInSide = triangleIndexInSide === levelSideCount - 1;
    const firstSide = angleShift;

    const sideIndex = isNextLevel
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

      for (const { pointIndex, triangle1Points, triangle2Points } of order) {
        renderer.renderLine(
          triangle1Points[pointIndex],
          triangle2Points[pointIndex]
        );

        yield;
      }
    }

    function* generateOrderInSide(side: number): Generator<{
      pointIndex: number;
      triangle1Points: Coordinates[];
      triangle2Points: Coordinates[];
    }> {
      const t1Side = sideIndex[side];
      const t2Side = getNextTriangleSide.call(this);

      const triangle1Points = triangle1[t1Side];
      const triangle2Points = triangle2[t2Side];

      const last = side ? density : density - 1;

      if (side === 0) {
        for (let n = 0; n <= last; n++) {
          yield { pointIndex: density - n, triangle1Points, triangle2Points };
        }
      } else {
        for (let n = last; n >= 1; n--) {
          yield { pointIndex: density - n, triangle1Points, triangle2Points };
        }
      }

      function getNextTriangleSide() {
        if (isNextLevel) {
          return this.#getNextIndexInTriangle(t1Side);
        } else {
          if (side === 0 && isLastTriangleInSide) {
            return 1;
          } else {
            if (side === 1 && isLastTriangleInSide) {
              return 0;
            } else {
              return this.#getNextIndexInTriangle(t1Side, 1);
            }
          }
        }
      }
    }
  }

  #getNextIndexInTriangle(index: number, direction = 1): number {
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

    const triangleLevels = this.getPoints();

    let levelIndex = -1;

    for (const level of triangleLevels) {
      levelIndex++;
      const isCapLevel = levelIndex === levels;

      let triangleIndex = -1;
      const lastIndexInLevel = level.length - 1;

      for (const triangle of level) {
        triangleIndex++;
        const levelSideCount = this.calc.countPerLevelSide[levelIndex];
        const triangleIndexInSide = triangleIndex % levelSideCount;

        if (fill && !isCapLevel) {
          if (triangleIndex === 0) {
            yield* this.generateStringsBetweenTriangles(renderer, {
              triangle1: level[lastIndexInLevel],
              triangle2: triangle,
              level: levelIndex,
              triangleIndex: lastIndexInLevel,
              triangleIndexInSide: lastIndexInLevel % levelSideCount,
            });
          }
          if (triangleIndex !== lastIndexInLevel) {
            yield* this.generateStringsBetweenTriangles(renderer, {
              triangle1: triangle,
              triangle2: level[triangleIndex + 1],
              level: levelIndex,
              triangleIndex,
              triangleIndexInSide,
            });
          }

          if (
            triangleIndexInSide % 2 === 0 &&
            (renderCaps || levelIndex < levels - 1)
          ) {
            const side = Math.floor(triangleIndex / levelSideCount);
            const nextLevelSideCount =
              this.calc.countPerLevelSide[levelIndex + 1];
            const nextLevelTriangleIndex =
              side * nextLevelSideCount + triangleIndexInSide + 1;

            yield* this.generateStringsBetweenTriangles(renderer, {
              triangle1: triangle,
              triangle2: triangleLevels[levelIndex + 1][nextLevelTriangleIndex],
              level: levelIndex,
              triangleIndex,
              triangleIndexInSide,
              isNextLevel: true,
            });
          }
        }

        const indexInSide =
          triangleIndex % this.calc.countPerLevelSide[levelIndex];

        if (renderTriangles && (!isCapLevel || indexInSide % 2)) {
          yield* this.generateTriangleStrings(renderer, {
            points: triangle,
            level: levelIndex,
            indexInSide,
          });
        }
      }
    }

    if (renderRing && ringSize) {
      yield* this.#circle.drawRing(renderer, {
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

    const {
      levels,
      density,
      fill,
      renderTriangles,
      renderCaps,
      ringNailCount = 0,
    } = this.config;
    const { triangleCount } = calc;

    const fillStepsPerTriangle = fill ? density * 2 : 0;
    const triangleSteps = renderTriangles ? density * 3 : 0;

    const stepsPerTriangle = triangleSteps + fillStepsPerTriangle;

    const levelsWithFillBetween = levels + (renderCaps ? 1 : 0);
    const fillStepsBetweenLevels =
      (fillStepsPerTriangle *
        (levelsWithFillBetween - 1) *
        6 *
        levelsWithFillBetween) /
      2;
    const stepsPerCap = density + 1;
    const capSteps =
      renderTriangles && renderCaps ? 6 * levels * stepsPerCap : 0;

    return (
      triangleCount * stepsPerTriangle +
      capSteps +
      fillStepsBetweenLevels +
      ringNailCount
    );
  }

  drawNails() {
    const triangleLevels = this.getPoints();
    let index = 0;
    for (const level of triangleLevels) {
      for (const triangle of level) {
        if (triangle != null) {
          // A cap level has nulls between caps
          for (const triangleSide of triangle) {
            for (const point of triangleSide) {
              this.nails.addNail({ point, number: index++ });
            }
          }
        }
      }
    }

    if (this.#circle) {
      this.#circle.drawNails(this.nails);
    }
  }

  thumbnailConfig = ({ density }) => ({
    density: Math.min(density, 3),
  });
}
