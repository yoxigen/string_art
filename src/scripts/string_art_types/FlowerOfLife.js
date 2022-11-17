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
      defaultValue: 20,
      type: 'range',
      attr: {
        min: 1,
        max: 100,
        step: 1,
      },
    },
  ];

  setUpDraw() {
    super.setUpDraw();
    const { levels, density } = this.config;
    this.edgeSize = Math.min(...this.size) / 2 / levels;
    this.nailsPerEdge = this.edgeSize / density;
    this.nailsLength = this.edgeSize / Math.sqrt(3) / 2;
  }

  getPoint(index) {
    if (this.points.has(index)) {
      return this.points.get(index);
    }

    const k = index * this.angleRadians;
    const r = this.radius * Math.sin(this.n * k);

    const point = [
      this.center[0] - r * Math.cos(k - this.rotationAngle),
      this.center[1] - r * Math.sin(k - this.rotationAngle),
    ];
    this.points.set(index, point);
    return point;
  }

  *generateTrianglePoints(position, rotation, triangleIndex) {
    console.log(
      'POINT',
      [
        position[0] + this.nailsLength * Math.cos(rotation + CENTER_ANGLE),
        position[1] - this.nailsLength * Math.sin(rotation + CENTER_ANGLE),
      ],
      { rotation, triangleIndex }
    );
    yield {
      point: [
        position[0] + this.nailsLength * Math.cos(rotation + CENTER_ANGLE),
        position[1] - this.nailsLength * Math.sin(rotation + CENTER_ANGLE),
      ],
      index: triangleIndex + 1,
    };
  }

  *generatePoints() {
    console.clear();
    yield { point: this.center, index: 0 };

    let triangleIndex = 0;

    for (let side = 0; side < 6; side++) {
      const sideRotation = (PI2 * side) / 6;

      // The Flower of Life is composed of six sides, each a triangle
      for (let level = 0; level < this.config.levels; level++) {
        // We run over each of the levels in each side
        const levelTriangleCount = 1 + level * 2; // Each level has 2 more triangles than the one before it (1, 3, 5, 7, ...)
        for (let i = 0; i < levelTriangleCount; i++) {
          // Then, we generate the points for each triangle
          const triangleRotation = sideRotation + CENTER_ANGLE * i;
          const trianglePosition = [
            this.center[0] + level * this.edgeSize * Math.cos(triangleRotation),
            this.center[1] - level * this.edgeSize * Math.sin(triangleRotation),
          ];
          console.log('TRIANGLE', {
            side,
            level,
            i,
            triangleIndex: triangleIndex + 1,
          });
          yield* this.generateTrianglePoints(
            trianglePosition,
            triangleRotation,
            triangleIndex
          );
          triangleIndex++;
        }
      }
    }
  }

  *generateStrings() {
    return;
  }

  getStepCount() {
    return 6;
  }

  drawNails() {
    const points = this.generatePoints();
    for (const { point, index } of points) {
      this.nails.addNail({ point, number: index });
    }
  }
}
