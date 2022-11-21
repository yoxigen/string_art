import { PI2 } from '../helpers/math_utils.js';
import StringArt from '../StringArt.js';
import Color from '../helpers/Color.js';

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#29f1ff',
    multicolorRange: 264,
    multicolorStart: 53,
    multicolorByLightness: false,
    minLightness: 30,
    maxLightness: 70,
  },
});

export default class FlowerOfLife extends StringArt {
  name = 'Flower of Life';
  id = 'flower_of_life';
  link =
    'https://www.reddit.com/r/psychedelicartwork/comments/mk97gi/rainbow_flower_of_life_uv_reactive_string_art/';
  controls = [
    {
      key: 'levels',
      label: 'Levels',
      defaultValue: 1,
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
        min: 2,
        max: 50,
        step: 1,
      },
    },
    {
      key: 'colorPerLevel',
      label: 'Color per level',
      defaultValue: false,
      type: 'checkbox',
    },
    COLOR_CONFIG,
  ];

  getStructureProps() {
    const { levels, density } = this.config;
    const edgeSize = Math.min(...this.size) / 2 / levels;
    const nailsLength = edgeSize / (2 * Math.cos(Math.PI / 6));

    return {
      edgeSize,
      triangleHeight: (edgeSize * Math.sqrt(3)) / 2,
      nailsLength,
      triangleCenterDistance: edgeSize / 2,
      maxTrianglesPerSide: 2 * (levels - 1) + 1,
      nailsPerTriangle: density * 3 + 1, // The center is shared, so counting it once
      nailDistance: nailsLength / density,
      triangleCount: 6 * levels ** 2,
    };
  }

  setUpDraw() {
    super.setUpDraw();
    Object.assign(this, this.getStructureProps());

    this.points = null;
    this.points = this.getPoints();

    this.stepCount = null;
    this.stepCount = this.getStepCount();

    const { isMultiColor, levels, colorPerLevel, ...config } = this.config;

    this.color = new Color({
      ...config,
      isMultiColor,
      colorCount: levels,
    });

    if (isMultiColor) {
      this.colorMap = this.color.getColorMap({
        stepCount: colorPerLevel ? levels : 1,
        colorCount: colorPerLevel ? levels : 1,
      });
    } else {
      this.colorMap = null;
    }
  }

  getTrianglePoints(center, isFlipped = false) {
    const initialAngle = isFlipped ? -Math.PI / 6 : -Math.PI / 2;

    // For each side of the triangle, the first point is the center of the triangle:
    const trianglePoints = new Array(3).fill(null).map(() => [center]);

    for (let side = 0; side < 3; side++) {
      const sideAngle = initialAngle + side * (PI2 / 3);
      const triangleSidePoints = trianglePoints[side];

      for (let n = 1; n <= this.config.density; n++) {
        triangleSidePoints.push([
          center[0] + n * this.nailDistance * Math.cos(sideAngle),
          center[1] + n * this.nailDistance * Math.sin(sideAngle),
        ]);
      }
    }

    return trianglePoints;
  }

  getPoints() {
    if (this.points) {
      return this.points;
    }

    const { levels } = this.config;

    const largeDistance = this.nailsLength;
    const smallDistance = this.triangleHeight - largeDistance;
    const levelsPoints = [];

    // The Flower of Life is composed of six sides, each a triangle
    for (let level = 0; level < levels; level++) {
      const levelTrianglesPoints = [];
      levelsPoints.push(levelTrianglesPoints);

      const levelTriangleTopCount = 3 + level * 2;

      const levelXStart =
        this.center[0] - this.triangleCenterDistance * (level + 1);
      const sides = [-1, 1]; // -1 is top side, 1 is bottom side

      for (const verticalOrientation of sides) {
        let isFlipped = verticalOrientation === 1; // Triangles start flipped on bottom lines (Flipped means the triangle points down instead of up)
        for (let i = 0; i < levelTriangleTopCount; i++) {
          const triangle = getTriangle.call(this, {
            verticalOrientation,
            isFlipped,
            xPosition: levelXStart + this.triangleCenterDistance * i,
            level,
            yLevel: level,
          });

          levelTrianglesPoints.push(triangle);
          isFlipped = !isFlipped;
        }
      }

      if (level !== 0) {
        for (let prevLevel = 0; prevLevel < level; prevLevel++) {
          for (const verticalOrientation of sides) {
            let isFlipped = verticalOrientation === -1;

            // Add 2 triangles on each side, top and down
            for (const horizontalOrientation of sides) {
              const xStart =
                this.center[0] +
                horizontalOrientation *
                  this.triangleCenterDistance *
                  (level + 1);

              for (let i = 0; i < 2; i++) {
                const triangle = getTriangle.call(this, {
                  verticalOrientation,
                  isFlipped,
                  xPosition:
                    this.center[0] +
                    (level + 1 + prevLevel + i) *
                      this.triangleCenterDistance *
                      horizontalOrientation,
                  level,
                  yLevel: level - prevLevel - 1,
                  triangleIndex: i,
                });

                levelTrianglesPoints.push(triangle);
                isFlipped = !isFlipped;
              }
            }
          }
        }
      }
    }

    return levelsPoints;

    function getTriangle({
      verticalOrientation,
      isFlipped,
      xPosition,
      yLevel,
      level,
    }) {
      const levelYDistanceFromCenter = yLevel * this.triangleHeight;

      const distanceFromLevelBaseline =
        verticalOrientation === 1
          ? isFlipped
            ? smallDistance
            : largeDistance
          : isFlipped
          ? largeDistance
          : smallDistance;

      const triangleCenterPoint = [
        xPosition,
        this.center[1] +
          (levelYDistanceFromCenter + distanceFromLevelBaseline) *
            verticalOrientation,
      ];

      return {
        points: this.getTrianglePoints(triangleCenterPoint, isFlipped),
        isFlipped,
        level,
      };
    }
  }

  *generateTriangleStrings({ points, level }) {
    this.ctx.strokeStyle = this.color.getColor(level);

    const { density } = this.config;

    let prevPoint = points[0][0];

    let isEnd = true;
    let side = 0;
    const nMax = Math.floor(this.config.density / 2);

    for (let n = 0; n <= nMax; n++) {
      const nSides = density % 2 === 0 && n === nMax ? 3 : 6;

      for (let s = 0; s < nSides; s++) {
        this.ctx.beginPath();
        this.ctx.moveTo(...prevPoint);

        side = side === 2 ? 0 : side + 1;
        const nextSidePoint = isEnd ? this.config.density - n : n;
        prevPoint = points[side][nextSidePoint];
        this.ctx.lineTo(...prevPoint);
        this.ctx.stroke();

        isEnd = !isEnd;

        if (s === 5 && n < nMax) {
          prevPoint = points[0][n + 1];
          this.ctx.lineTo(...prevPoint);
          this.ctx.stroke();
        }
        yield;
      }
    }
  }

  *generateStrings() {
    const triangleLevels = this.getPoints();

    for (const level of triangleLevels) {
      for (const triangle of level) {
        yield* this.generateTriangleStrings(triangle);
      }
    }
  }

  getStepCount() {
    if (this.stepCount) {
      return this.stepCount;
    }

    const { levels, density } = this.config;
    const triangleCount = this.triangleCount ?? 6 * levels ** 2;

    const stepsPerTriangle =
      (Math.floor(density / 2) + 1) * 6 - (density % 2 ? 0 : 3);

    return triangleCount * stepsPerTriangle;
  }

  drawNails() {
    const triangleLevels = this.getPoints();
    let index = 0;
    for (const level of triangleLevels) {
      for (const triangle of level) {
        for (const triangleSide of triangle.points) {
          for (const point of triangleSide) {
            this.nails.addNail({ point, number: index++ });
          }
        }
      }
    }
  }
}
