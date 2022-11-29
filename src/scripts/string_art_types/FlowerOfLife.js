import { PI2 } from '../helpers/math_utils.js';
import StringArt from '../StringArt.js';
import Color from '../helpers/Color.js';
import Polygon from '../helpers/Polygon.js';
import Circle from '../helpers/Circle.js';

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#29f1ff',
    multicolorRange: 236,
    multicolorStart: 337,
    multicolorByLightness: true,
    minLightness: 50,
    maxLightness: 90,
    colorCount: 3,
    repeatColors: true,
    saturation: 76,
    reverseColors: true,
  },
  customControls: [
    {
      key: 'fillColor',
      label: 'Fill color',
      defaultValue: '#254146',
      type: 'color',
      show: ({ fill }) => fill,
    },
    {
      key: 'colorPerLevel',
      label: 'Color per level',
      defaultValue: true,
      type: 'checkbox',
    },
  ],
});

const ANGLE = -PI2 / 6; // The angle of a equilateral triangle;
const SIDE_ANGLES = new Array(6)
  .fill(null)
  .map((_, i) => Math.PI / 2 + ANGLE * i);

export default class FlowerOfLife extends StringArt {
  name = 'Flower of Life';
  id = 'flower_of_life';
  link =
    'https://www.reddit.com/r/psychedelicartwork/comments/mk97gi/rainbow_flower_of_life_uv_reactive_string_art/';
  controls = [
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
      displayValue: (config, { key }) => `${config[key]}°`,
    },
    {
      key: 'renderTriangles',
      label: 'Triangles',
      defaultValue: true,
      type: 'checkbox',
    },
    {
      key: 'renderCaps',
      label: 'Caps',
      defaultValue: true,
      type: 'checkbox',
    },
    {
      key: 'fill',
      label: 'Fill',
      defaultValue: true,
      type: 'checkbox',
    },
    COLOR_CONFIG,
  ];

  defaultValues = {
    nailsColor: '#474747',
  };

  getStructureProps() {
    const { levels, density, margin, globalRotation, renderCaps } = this.config;
    const globalRotationRadians =
      (globalRotation * Math.PI) / 180 + Math.PI / 6;

    const polygon = new Polygon({
      sides: 6,
      size: this.getSize(),
      margin,
      rotation: globalRotationRadians,
      fitSize: false,
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
    };
  }

  setUpDraw() {
    super.setUpDraw();

    const structureProps = this.getStructureProps();
    const structureChanged = Object.entries(structureProps).some(
      ([key, value]) =>
        key === 'countPerLevelSide'
          ? value.join(',') !== this[key].join(',')
          : value !== this[key]
    );

    if (structureChanged) {
      Object.assign(this, structureProps);
      this.points = null;
      this.points = this.getPoints();

      this.stepCount = null;
      this.stepCount = this.getStepCount();
    }

    const { isMultiColor, levels, colorPerLevel, colorCount, ...config } =
      this.config;

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

  getTrianglePoints({ center, rotation, isCapLevel, triangleIndexInSide }) {
    let missingSide;
    if (isCapLevel) {
      const triangleIndex = (triangleIndexInSide + 2) % 3;
      missingSide = this._getNextIndexInTriangle(triangleIndex);
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
        const nNailDistance = n * this.nailDistance;

        triangleSidePoints.push([
          center[0] + nNailDistance * cosSideAngle,
          center[1] + nNailDistance * sinSideAngle,
        ]);
      }
    }

    return trianglePoints;
  }

  getPoints() {
    if (this.points) {
      return this.points;
    }

    const { levels, renderCaps } = this.config;

    const largeDistance = this.nailsLength;
    const smallDistance = this.triangleHeight - largeDistance;
    const levelsPoints = [];

    const levelsCount = renderCaps ? levels + 1 : levels;

    for (let level = 0; level < levelsCount; level++) {
      const isCapLevel = renderCaps && level === levels;

      const levelTrianglesPoints = [];
      levelsPoints.push(levelTrianglesPoints);

      const levelSideTriangleCount = this.countPerLevelSide[level];

      // Caching distances to avoid repeated calculations for each side:
      const levelPositions = new Array(levelSideTriangleCount)
        .fill(null)
        .map((_, n) => {
          const isFlipped = n % 2 === 0;
          const trianglePosition = [
            this.triangleCenterDistance * (n - level),
            level * this.triangleHeight +
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
            sideRotation - rotation - this.globalRotationRadians;

          const rotatedTrianglePosition = [
            this.center[0] + distanceFromCenter * Math.cos(triangleCenterAngle),
            this.center[1] - distanceFromCenter * Math.sin(triangleCenterAngle),
          ];

          const trianglePoints = this.getTrianglePoints({
            center: rotatedTrianglePosition,
            rotation:
              sideRotation +
              (side * PI2) / 3 -
              n * ANGLE +
              this.globalRotationRadians,
            isCapLevel,
            triangleIndexInSide: n,
          });

          levelTrianglesPoints.push(trianglePoints);
        }
      }
    }

    return levelsPoints;
  }

  *generateTriangleStrings({ points, level, indexInSide }) {
    this.ctx.strokeStyle = this.color.getColor(level);
    const { density, levels } = this.config;
    const isCapLevel = level === levels;

    const initialSide = isCapLevel
      ? this._getNextIndexInTriangle(indexInSide % 3)
      : 0;
    const lastSide = isCapLevel ? initialSide : 2;

    for (let side = initialSide; side <= lastSide; side++) {
      const nextSide = this._getNextIndexInTriangle(side);
      let prevPoint = points[side][0];

      for (let n = 0; n <= density; n++) {
        const isNextSide = n % 2 === 0;

        this.ctx.beginPath();
        this.ctx.moveTo(...prevPoint);

        const nextSidePoint = isNextSide ? this.config.density - n : n;
        const targetSide = isNextSide ? nextSide : side;

        prevPoint = points[targetSide][nextSidePoint];
        this.ctx.lineTo(...prevPoint);
        this.ctx.stroke();

        if (n < density) {
          prevPoint =
            points[targetSide][
              isNextSide ? nextSidePoint - 1 : nextSidePoint + 1
            ];
          this.ctx.lineTo(...prevPoint);
          this.ctx.stroke();
        }
        yield;
      }
    }
  }

  *generateStringsBetweenTriangles({
    triangle1,
    triangle2,
    level,
    triangleIndex,
  }) {
    const { density, fillColor } = this.config;
    const levelSideCount = this.countPerLevelSide[level];
    const angleShift = (triangleIndex % levelSideCount) % 3;

    this.ctx.strokeStyle = fillColor;

    const triangleIndexInSide = triangleIndex % levelSideCount;
    const isLastTriangleInSide = triangleIndexInSide === levelSideCount - 1;

    const firstSide = angleShift;
    const sideIndex = [
      firstSide,
      this._getNextIndexInTriangle(firstSide, triangleIndexInSide % 2 ? 1 : -1),
    ];

    for (let s = 0; s < 2; s++) {
      const t1Side = sideIndex[s];
      const t2Side =
        s === 0 && isLastTriangleInSide
          ? 1
          : s === 1 && isLastTriangleInSide
          ? 0
          : this._getNextIndexInTriangle(t1Side, 1);
      const triangle1Points = triangle1[t1Side];
      const triangle2Points = triangle2[t2Side];

      const last = s ? density : density - 1;

      for (let n = s ? 1 : 0; n <= last; n++) {
        this.ctx.beginPath();
        this.ctx.moveTo(...triangle1Points[density - n]);
        this.ctx.lineTo(...triangle2Points[density - n]);
        this.ctx.stroke();
        yield;
      }
    }

    // const COLORS = ['#f00', '#0f0', '#00f'];

    // for (let s = 0; s < 3; s++) {
    //   this.ctx.strokeStyle = COLORS[s];
    //   this.ctx.beginPath();
    //   this.ctx.moveTo(...triangle1[s][0]);
    //   this.ctx.lineTo(...triangle1[s][density]);
    //   this.ctx.stroke();
    //   yield;
    // }
  }

  _getNextIndexInTriangle(index, direction = 1) {
    const result = index + direction;
    if (result < 0) {
      return 2;
    }
    if (result > 2) {
      return 0;
    }
    return result;
  }

  *generateStrings() {
    const { fill, renderTriangles, levels } = this.config;

    const triangleLevels = this.getPoints();

    let levelIndex = -1;

    for (const level of triangleLevels) {
      levelIndex++;
      const isCapLevel = levelIndex === levels;

      let triangleIndex = -1;
      for (const triangle of level) {
        triangleIndex++;
        if (fill && !isCapLevel) {
          yield* this.generateStringsBetweenTriangles({
            triangle1: triangle,
            triangle2:
              level[triangleIndex === level.length - 1 ? 0 : triangleIndex + 1],
            level: levelIndex,
            triangleIndex,
          });
        }

        const indexInSide = triangleIndex % this.countPerLevelSide[levelIndex];

        if (renderTriangles && (!isCapLevel || indexInSide % 2)) {
          yield* this.generateTriangleStrings({
            points: triangle,
            level: levelIndex,
            indexInSide,
          });
        }
      }
    }
  }

  getStepCount() {
    if (this.stepCount) {
      return this.stepCount;
    }

    const { levels, density, fill, renderTriangles, renderCaps } = this.config;
    const triangleCount = this.triangleCount ?? 6 * levels ** 2;

    const fillSteps = fill ? (density + 1) * 2 - 2 : 0;
    const triangleSteps = renderTriangles ? (density + 1) * 3 : 0;

    const stepsPerTriangle = triangleSteps + fillSteps;

    const stepsPerCap = density + 1;
    const capSteps = renderCaps ? 6 * levels * stepsPerCap : 0;

    return triangleCount * stepsPerTriangle + capSteps;
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
  }

  static thumbnailConfig = {
    levels: 3,
    density: 3,
    fill: false,
  };
}
