import { PI2 } from '../helpers/math_utils.js';
import StringArt from '../StringArt.js';

const CENTER_ANGLE = Math.PI / 6;

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
    };
  }

  setUpDraw() {
    super.setUpDraw();
    Object.assign(this, this.getStructureProps());

    this.stepCount = null;
    this.stepCount = this.getStepCount();
  }

  *generateTrianglePoints(center, isFlipped = false, triangleIndex) {
    const initialAngle = isFlipped ? -Math.PI / 6 : -Math.PI / 2;
    let nailIndex = triangleIndex * this.nailsPerTriangle;

    // Yield first the center point of the triangle
    yield {
      point: center,
      index: nailIndex++,
    };

    for (let side = 0; side < 3; side++) {
      const sideAngle = initialAngle + side * (PI2 / 3);
      for (let n = 1; n <= this.config.density; n++) {
        yield {
          point: [
            center[0] + n * this.nailDistance * Math.cos(sideAngle),
            center[1] + n * this.nailDistance * Math.sin(sideAngle),
          ],
          index: nailIndex++,
        };
      }
    }
  }

  *generatePoints() {
    //console.clear();

    let triangleIndex = 0;
    const largeDistance = this.nailsLength;
    const smallDistance = this.triangleHeight - largeDistance;

    // The Flower of Life is composed of six sides, each a triangle
    for (let level = 0; level < this.config.levels; level++) {
      const levelTriangleSideCount = this.maxTrianglesPerSide - level;
      const levelTriangleCount = 1 + 2 * levelTriangleSideCount;

      const levelXStart =
        this.center[0] - levelTriangleSideCount * this.triangleCenterDistance;

      const levelYDistanceFromCenter = level * this.triangleHeight;

      const sides = [-1, 1]; // -1 is top side, 1 is bottom side

      for (const side of sides) {
        for (let i = 0; i < levelTriangleCount; i++) {
          let isFlipped = i % 2 !== 0; // Flipped means the triangle points down instead of up
          if (side === 1) {
            isFlipped = !isFlipped;
          }

          const distanceFromLevelBaseline =
            side === 1
              ? isFlipped
                ? smallDistance
                : largeDistance
              : isFlipped
              ? largeDistance
              : smallDistance;

          yield* this.generateTrianglePoints(
            [
              levelXStart + this.triangleCenterDistance * i,
              this.center[1] +
                (levelYDistanceFromCenter + distanceFromLevelBaseline) * side,
            ],
            isFlipped,
            triangleIndex++
          );
        }
      }
    }
  }

  *generateStrings() {
    return;
  }

  getStepCount() {
    if (this.stepCount) {
      return this.stepCount;
    }

    return (
      6 *
      this.config.levels ** 2 *
      (this.nailsPerTriangle ?? this.config.density * 3 + 1)
    );
  }

  drawNails() {
    const points = this.generatePoints();
    for (const { point, index } of points) {
      this.nails.addNail({ point, number: index });
    }
  }
}
