import Color from '../helpers/Color.js';
import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    colorCount: 7,
    color: '#ffbb29',
    multicolorRange: '21',
    multicolorStart: 32,
    multicolorByLightness: true,
    minLightness: 36,
    maxLightness: 98,
  },
});

export default class Portal extends StringArt {
  id = 'portal';
  name = 'Portal';
  controls = [
    {
      key: 'density',
      label: 'Density',
      defaultValue: 20,
      type: 'range',
      attr: { min: 1, max: 100, step: 1 },
      isStructural: true,
    },
    {
      key: 'r',
      label: 'Radius',
      defaultValue: 12.5,
      type: 'range',
      attr: {
        min: 1,
        max: 49,
        step: 1,
      },
      displayValue: ({ r }) => r + '%',
      isStructural: true,
    },
    {
      key: 'circleX',
      label: 'Circle X',
      defaultValue: 0.5,
      type: 'range',
      attr: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      displayValue: ({ circleX }) => Math.round(circleX * 100) + '%',
      isStructural: true,
    },
    {
      key: 'circleY',
      label: 'Circle Y',
      defaultValue: 0.5,
      type: 'range',
      attr: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      displayValue: ({ circleY }) => Math.round(circleY * 100) + '%',
      isStructural: true,
    },
  ];

  getCalc() {
    const { density, r, circleX, circleY } = this.config;
    const size = this.size ?? this.getSize();
    const smallSide = Math.min(...size);
    const radius = (smallSide * r) / 100;
    const diameter = radius * 2;
    const circleCenter = [
      radius + (size[0] - diameter) * circleX,
      radius + (size[1] - diameter) * circleY,
    ];
    const nailDistance = Math.max(...size) / density;
    const countWidth = Math.round(size[0] / nailDistance);
    const countHeight = Math.round(size[1] / nailDistance);

    const sides = [
      { count: countWidth, getPoint: i => [i * nailDistance, 0] },
      { count: countHeight, getPoint: i => [width, i * nailDistance] },
      { count: countWidth, getPoint: i => [width - i * nailDistance, height] },
      { count: countHeight, getPoint: i => [0, height - i * nailDistance] },
    ];

    return {
      nailDistance,
      radius,
      circleCenter,
      sides,
      ...this.getRanges({ size, radius, circleCenter }),
    };
  }

  getPointDistanceToCircleCenter(point) {
    return Math.sqrt(
      (point[0] - this.calc.circleCenter[0]) ** 2 +
        (point[1] - this.calc.circleCenter[1]) ** 2
    );
  }

  getRanges({ size, radius, circleCenter }) {
    const ranges = [];

    let startAtRightSide = true;

    // Top of left side
    const leftTopDistanceFromCircleCenter = this.getPointDistanceToCircleCenter(
      [0, 0]
    );
    const angleToRightSide =
      Math.PI / 2 -
      (Math.asin(radius / leftTopDistanceFromCircleCenter) +
        Math.atan(circleCenter[0] / circleCenter[1]));
    const rightSideY = size[0] * Math.tan(angleToRightSide);

    if (rightSideY <= size[1]) {
      ranges.leftTop = [size[0], rightSideY];
    } else {
      startAtRightSide = false;
      const bottomSideX = size[1] / Math.tan(angleToRightSide);
      ranges.leftTop = [bottomSideX, size[1]];
    }

    // Right of top side
    const rightTopDistanceFromCircleCenter =
      this.getPointDistanceToCircleCenter([size[0], 0]);
    const angleToLeftSide =
      Math.atan(circleCenter[1] / (size[0] - circleCenter[0])) +
      Math.asin(radius / rightTopDistanceFromCircleCenter);
    const bottomSideXFromRightTop =
      size[0] - size[1] / Math.tan(angleToLeftSide);

    if (bottomSideXFromRightTop >= 0) {
      ranges.rightTop = [bottomSideXFromRightTop, size[1]];
    } else {
      const leftSideY = size[0] * Math.tan(angleToLeftSide);
      ranges.rightTop = [0, leftSideY];
    }

    // Bottom of right side
    const bottomRightDistanceFromCircleCenter =
      this.getPointDistanceToCircleCenter(size);
    const angleToTopSide =
      Math.asin(radius / bottomRightDistanceFromCircleCenter) +
      Math.atan((size[0] - circleCenter[0]) / (size[1] - circleCenter[1]));
    const topSideX = size[0] - size[1] * Math.tan(angleToTopSide);

    if (topSideX >= 0) {
      ranges.rightBottom = [topSideX, 0];
    } else {
      const leftSideY = size[1] - size[0] / Math.tan(angleToTopSide);
      ranges.rightBottom = [0, leftSideY];
    }

    // Left of bottom side
    const leftBottomDistanceFromCircleCenter =
      this.getPointDistanceToCircleCenter([0, size[1]]);
    const angleFromTopSide =
      Math.atan((size[1] - circleCenter[1]) / circleCenter[0]) +
      Math.asin(radius / leftBottomDistanceFromCircleCenter);
    const topSideXFromBottomLeft = size[1] / Math.tan(angleFromTopSide);

    if (topSideXFromBottomLeft <= size[0]) {
      ranges.leftBottom = [topSideXFromBottomLeft, 0];
    } else {
      const rightSideY = size[1] - size[0] * Math.tan(angleFromTopSide);
      ranges.leftBottom = [size[0], rightSideY];
    }

    return Object.freeze({
      ranges: [
        [ranges.leftTop, [0, 0]],
        [ranges.rightTop, [size[0], 0]],
        [ranges.rightBottom, [size[0], size[1]]],
        [ranges.leftBottom, [0, size[1]]],
      ],
      firstSide: startAtRightSide ? 1 : 2,
    });
  }

  resetStructure() {
    this.points = null;
    this.calc = null;
  }

  onConfigChange({ controls }) {
    if (controls.some(({ control }) => control.isStructural)) {
      this.resetStructure();
      if (controls.some(({ control }) => control.affectsStepCount !== false)) {
        this.stepCount = null;
      }
    }
  }

  onResize() {
    this.resetStructure();
  }

  setUpDraw() {
    super.setUpDraw();

    if (!this.calc) {
      this.calc = this.getCalc();
    }
  }

  getPointDestination(point) {
    const distanceToCircleCenter = this.getPointDistanceToCircleCenter(point);
    const isHorizontal = point[1] === 0 || point[1] === this.size[1];

    const angleBetweenPointSideAndDistanceToCircleCenter = (isHorizontal ? Math.asin(point[1] - this.calc.circleCenter[1]) : // Horizontal sinus goes here!) / distanceToCircleCenter;
  }

  getFirstPointDestinationSide() {
    for (const range of this.calc.ranges) {
    }
  }

  *generateStrings() {
    const { circleCenter, radius } = this.calc;

    const points = this.generatePoints();

    let index = 0;
    this.ctx.strokeStyle = '#fff';

    // for (const [source, destination] of this.calc.ranges) {
    //   this.ctx.beginPath();
    //   this.ctx.moveTo(...source);
    //   this.ctx.lineTo(...destination);
    //   this.ctx.stroke();
    //   yield;
    // }

    let sideIndex = this.calc.firstSide;
    let side = this.calc.sides[sideIndex];
    let range = this.calc.ranges[0][0];

    for (const point of points) {
      const width = circleCenter[0] - point[0];
      const height = point[1] - circleCenter[1];

      const beta = Math.atan(height / width);
      const alpha =
        Math.atan(height / width) +
        Math.asin((radius * Math.sin(beta)) / height);

      let destination = [
        this.size[0],
        point[1] - this.size[0] * Math.tan(alpha),
      ];
      if (destination[1] < 0) {
        destination = [point[1] / Math.tan(alpha) + point[0], 0];
      } else if (destination[1] > this.size[1]) {
        destination = [
          (this.size[1] - point[1]) / Math.tan(Math.PI * 2 - alpha) + point[0],
          this.size[1],
        ];
      }

      console.log(JSON.stringify({ point, destination, size: this.size }));

      this.ctx.beginPath();
      this.ctx.moveTo(...point);
      this.ctx.lineTo(...destination);
      this.ctx.stroke();

      yield;
    }
  }

  *generatePoints() {
    const { nailDistance } = this.calc;
    const [width, height] = this.size;

    const countWidth = Math.round(width / nailDistance);
    const countHeight = Math.round(height / nailDistance);

    const sides = [
      { count: countWidth, getPoint: i => [i * nailDistance, 0] },
      { count: countHeight, getPoint: i => [width, i * nailDistance] },
      { count: countWidth, getPoint: i => [width - i * nailDistance, height] },
      { count: countHeight, getPoint: i => [0, height - i * nailDistance] },
    ];

    for (const { count, getPoint } of sides) {
      for (let i = 0; i < count; i++) {
        yield getPoint(i); // Add side, use that to determine direction in getStrings
      }
    }
  }

  getStepCount() {
    const { nailDistance } = this.getCalc();
    const [width, height] = this.size ?? this.getSize();
    return Math.floor(width / nailDistance + height / nailDistance) * 2;
  }

  drawNails() {
    const points = this.generatePoints();
    let index = 0;
    for (const point of points) {
      this.nails.addNail({ point, number: index++ });
    }
  }
  static thumbnailConfig = {
    density: 3,
  };
}
