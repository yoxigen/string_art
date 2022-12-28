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
    const nailDistanceSmallSide = Math.min(...size) / density;
    const nailDistanceLargeSide = nailDistanceSmallSide + Math.max(...size) % nailDistanceSmallSide;

    return {
      nailDistance: [size[0] <= size[1] ? nailDistanceSmallSide : nailDistanceLargeSide, size[0] > size[1] ? nailDistanceSmallSide : nailDistanceLargeSide],
      radius,
      circleCenter,
    };
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
    const [pointX, pointY] = point;
    const [centerX, centerY] = this.calc.circleCenter;

    const isBottom = pointY === height;
    const isRight = pointX === width;

    const distanceToCircleCenter = Math.sqrt(
        (pointX - centerX) ** 2 +
        (pointY - centerY) ** 2
    );

    const tangentAngle = Math.asin(this.calc.radius / distanceToCircleCenter);

    const isPointHorizontal = pointY === 0 && pointX !== this.size[0] || pointY === this.size[1] && pointX !== 0;

    const isAfterCenter = isPointHorizontal
        ? isBottom
            ? pointX < centerX
            : pointX > centerX
        : isRight
            ? pointY > centerY
            : pointY < centerY;

    const angleBetweenPointSideAndDistanceToCircleCenter = Math.asin((isPointHorizontal
        ? isBottom ? pointY - centerY : centerY
        : isRight ? pointX - centerX : centerX
    ) / distanceToCircleCenter);

    const tanAngle = Math.tan(isAfterCenter
        ? angleBetweenPointSideAndDistanceToCircleCenter + tangentAngle
        : angleBetweenPointSideAndDistanceToCircleCenter - tangentAngle
    );

    let nextSide = isPointHorizontal
        ? pointY === 0 ? 1 : 3
        : pointX === 0 ? 0 : 2;

    if (isAfterCenter) {
        nextSide++;
        if (nextSide > 3) {
            nextSide = 0;
        }
    }
    let nextSideValue = isAfterCenter
        ? isPointHorizontal
            ? isBottom ? pointX + height / tanAngle : (width - pointX) + height / tanAngle
            : isRight ? (height - pointY) + width / tanAngle : pointY + width / tanAngle
        : isPointHorizontal
            ? isBottom ? pointX * tanAngle : (width - pointX) * tanAngle
            : isRight ? (height - pointY) * tanAngle : pointY * tanAngle;

    // When perfect circle isn't enabled, it means that points have to be only on nail positions,
    // so rounding the destination point to the nearest nail position.
    if (!this.config.isPerfectCircle) {
        const nailDistance = this.calc.nailDistance[nextSide % 2 ? 1 : 0];
        const leftOverFromLastNail = nextSideValue % nailDistance;
        nextSideValue = nextSideValue - leftOverFromLastNail;
        if (leftOverFromLastNail > nailDistance / 2) {
            nextSideValue += nailDistance;
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

    const countWidth = Math.ceil(width / nailDistance[0]);
    const countHeight = Math.ceil(height / nailDistance[1]);

    const sides = [
      { count: countWidth, getPoint: i => [i * nailDistance[0], 0] },
      { count: countHeight, getPoint: i => [width, i * nailDistance[1]] },
      { count: countWidth, getPoint: i => [width - i * nailDistance[0], height] },
      { count: countHeight, getPoint: i => [0, height - i * nailDistance[1]] },
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
    return Math.ceil(width / nailDistance[0] + height / nailDistance[1]) * 2;
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
