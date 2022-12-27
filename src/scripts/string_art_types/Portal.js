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

const SIDES = [
    { right: false, bottom: false, getPoint: value => [value, 0] },
    { right: true, bottom: false, getPoint: (value, size) => [size[0], value] },
    { right: false, bottom: true, inverse: true, getPoint: (value, size) => [size[0] - value, size[1]] },
    { right: false, bottom: false, inverse: true, getPoint: (value, size) => [0, size[1] - value] },
];

export default class Portal extends StringArt {
  id = 'portal';
  name = 'Portal';
  controls = [
    {
      key: 'density',
      label: 'Density',
      defaultValue: 75,
      type: 'range',
      attr: { min: 1, max: 160, step: 1 },
      isStructural: true,
    },
    {
      key: 'r',
      label: 'Radius',
      defaultValue: 20,
      type: 'range',
      attr: {
        min: 0,
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
      defaultValue: 0.3,
      type: 'range',
      attr: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      displayValue: ({ circleY }) => Math.round(circleY * 100) + '%',
      isStructural: true,
    },
    {
        key: 'isPerfectCircle',
        label: 'Perfect circle',
        defaultValue: false,
        type: 'checkbox',
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

    return {
      nailDistance,
      radius,
      circleCenter,
    };
  }

  getPointDistanceToCircleCenter(point) {
    return Math.sqrt(
      (point[0] - this.calc.circleCenter[0]) ** 2 +
        (point[1] - this.calc.circleCenter[1]) ** 2
    );
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
    const [width, height] = this.size;

    const isBottom = point[1] === height;
    const isRight = point[0] === width;

    const [centerX, centerY] = this.calc.circleCenter;

    const distanceToCircleCenter = this.getPointDistanceToCircleCenter(point); // Always the same
    const tangentAngle = Math.asin(this.calc.radius / distanceToCircleCenter); // Always the same

    const isPointHorizontal = point[1] === 0 && point[0] !== this.size[0] || point[1] === this.size[1] && point[0] !== 0;

    const isAfterCenter = isPointHorizontal
        ? isBottom
            ? point[0] < centerX
            : point[0] > centerX
        : isRight
            ? point[1] > centerY
            : point[1] < centerY;

    const angleBetweenPointSideAndDistanceToCircleCenter = Math.asin((isPointHorizontal
        ? isBottom ? point[1] - this.calc.circleCenter[1] : this.calc.circleCenter[1]
        : isRight ? point[0] - this.calc.circleCenter[0] : this.calc.circleCenter[0]
    ) / distanceToCircleCenter);

    const tanAngle = isAfterCenter ? Math.tan(angleBetweenPointSideAndDistanceToCircleCenter + tangentAngle) : Math.tan(angleBetweenPointSideAndDistanceToCircleCenter - tangentAngle);

    let nextSide = isPointHorizontal
        ? point[1] === 0 ? 1 : 3
        : point[0] === 0 ? 0 : 2;

    if (isAfterCenter) {
        nextSide++;
        if (nextSide > 3) {
            nextSide = 0;
        }
    }
    let nextSideValue = isAfterCenter
        ? isPointHorizontal
            ? isBottom ? point[0] + height / tanAngle : (width - point[0]) + height / tanAngle
            : isRight ? (height - point[1]) + width / tanAngle : point[1] + width / tanAngle
        : isPointHorizontal
            ? isBottom ? point[0] * tanAngle : (width - point[0]) * tanAngle
            : isRight ? (height - point[1]) * tanAngle : point[1] * tanAngle;

    if (!this.config.isPerfectCircle) {
        // TODO: Vertical and horizontal shouldn't be the same nail distance, because then nails aren't even in one side.
        // Need to find a close distance for the other side. Then use that for rounding here.
        const leftOverFromLastNail = nextSideValue % this.calc.nailDistance;
        nextSideValue = nextSideValue - leftOverFromLastNail;
        if (leftOverFromLastNail > this.calc.nailDistance / 2) {
            nextSideValue += this.calc.nailDistance;
        }
    }

    return SIDES[nextSide].getPoint(nextSideValue, this.size);
  }

  *generateStrings() {
    const points = this.generatePoints();

    this.ctx.strokeStyle = '#fff';

    for (const point of points) {
        const destinationPoint = this.getPointDestination(point);

        this.ctx.beginPath();
        this.ctx.moveTo(...point);
        this.ctx.lineTo(...destinationPoint);
        this.ctx.stroke();

      yield;
    }
  }

  *generatePoints() {
    const { nailDistance } = this.calc;
    const [width, height] = this.size;

    const countWidth = Math.ceil(width / nailDistance);
    const countHeight = Math.ceil(height / nailDistance);

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
    return Math.ceil(width / nailDistance + height / nailDistance) * 2;
  }

  drawNails() {
    const points = this.generatePoints();
    let index = 0;
    for (const point of points) {
      this.nails.addNail({ point, number: index++ });
    }
  }
  static thumbnailConfig = {
    density: 16,
    isPerfectCircle: true
  };
}
