import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';

export default class Star extends StringArt {
  name = 'Star';
  id = 'star';
  link =
    'https://www.etsy.com/listing/557818258/string-art-meditation-geometric-yoga?epik=dj0yJnU9Mm1hYmZKdks1eTc3bVY2TkVhS2p2Qlg0N2dyVWJxaTEmcD0wJm49MGlWSXE1SVJ2Vm0xZ0xtaGhITDBWQSZ0PUFBQUFBR0Zwd2lj';
  controls = [
    {
      key: 'sides',
      label: 'Sides',
      defaultValue: 3,
      type: 'range',
      attr: { min: 3, max: 20, step: 1 },
    },
    {
      key: 'sideNails',
      label: 'Nails per side',
      defaultValue: 40,
      type: 'range',
      attr: { min: 1, max: 200, step: 1 },
    },
    {
      key: 'ringSize',
      label: 'Outer ring size',
      defaultValue: 0.1,
      type: 'range',
      attr: {
        min: 0,
        max: 0.5,
        step: ({ config: { sideNails, sides } }) => 1 / (sideNails * sides),
      },
      displayValue: ({ sideNails, sides, ringSize }) =>
        Math.floor(ringSize * sideNails * sides),
    },
    Circle.rotationConfig,
    {
      key: 'colorGroup',
      label: 'Color',
      type: 'group',
      children: [
        {
          key: 'innerColor',
          label: 'Star color',
          defaultValue: '#2ec0ff',
          type: 'color',
        },
        {
          key: 'outterColor',
          label: 'Outter color',
          defaultValue: '#2a82c6',
          type: 'color',
        },
        {
          key: 'ringColor',
          label: 'Ring color',
          defaultValue: '#b094ff',
          type: 'color',
        },
      ],
    },
  ];

  get n() {
    if (!this._n) {
      const { n, sides } = this.config;
      const extraNails = n % sides;
      this._n = n - extraNails;
    }

    return this._n;
  }

  setUpDraw() {
    this._n = null;
    super.setUpDraw();

    const { sides, rotation, sideNails, margin = 0, ringSize } = this.config;
    const circleConfig = {
      size: this.size,
      n: sideNails * sides,
      margin,
      rotation,
    };

    if (this.circle) {
      this.circle.setConfig(circleConfig);
    } else {
      this.circle = new Circle(circleConfig);
    }

    this.sideAngle = (Math.PI * 2) / sides;
    this.nailSpacing = this.circle.radius / sideNails;
    this.starCenterStart = (sideNails % 1) * this.nailSpacing;

    if ((this.renderRing = ringSize > 0)) {
      this.ringDistance = Math.floor(ringSize * circleConfig.n);
    }

    this.sides = new Array(sides).fill(null).map((_, side) => {
      const sideAngle = side * this.sideAngle + this.circle.rotationAngle;
      const circlePointsStart = side * sideNails;

      return {
        sinSideAngle: Math.sin(sideAngle),
        cosSideAngle: Math.cos(sideAngle),
        circlePointsStart,
        circlePointsEnd: circlePointsStart + sideNails,
      };
    });
  }

  getStarPoint({ side, sideIndex }) {
    const radius = this.starCenterStart + sideIndex * this.nailSpacing;
    const { sinSideAngle, cosSideAngle } = this.sides[side];
    const [centerX, centerY] = this.circle.center;

    return [centerX + sinSideAngle * radius, centerY + cosSideAngle * radius];
  }

  *generateStarPoints({ reverseOrder = false } = {}) {
    const { sides, sideNails } = this.config;

    for (let side = 0; side < sides; side++) {
      const prevSide = side === 0 ? sides - 1 : side - 1;
      for (let i = 0; i < sideNails; i++) {
        const sideIndex = reverseOrder ? sideNails - i : i;
        yield {
          side,
          prevSide,
          sideIndex,
          point: this.getStarPoint({ side, sideIndex }),
        };
      }
    }
  }

  *drawStar() {
    const { innerColor, sideNails } = this.config;

    this.ctx.strokeStyle = innerColor;
    let prevPoint;

    for (const { prevSide, sideIndex, point } of this.generateStarPoints()) {
      this.ctx.beginPath();

      if (sideIndex && !(sideIndex % 2)) {
        this.ctx.moveTo(...prevPoint);
        this.ctx.lineTo(...point);
      } else {
        this.ctx.moveTo(...point);
      }

      const prevSideIndex = sideNails - sideIndex;
      this.ctx.lineTo(
        ...this.getStarPoint({ side: prevSide, sideIndex: prevSideIndex })
      );
      prevPoint = point;
      this.ctx.stroke();
      yield;
    }
  }

  *drawCircle() {
    const { outterColor } = this.config;

    let prevCirclePoint;
    let isPrevSide = false;
    this.ctx.strokeStyle = outterColor;
    for (const { side, prevSide, sideIndex, point } of this.generateStarPoints({
      reverseOrder: true,
    })) {
      this.ctx.beginPath();
      if (!prevCirclePoint) {
        prevCirclePoint = this.circle.getPoint(
          this.sides[prevSide].circlePointsStart
        );
      }

      this.ctx.moveTo(...prevCirclePoint);

      this.ctx.lineTo(...point);
      this.ctx.stroke();

      yield;

      this.ctx.beginPath();
      this.ctx.moveTo(...point);
      const nextPointIndex = isPrevSide
        ? this.sides[prevSide].circlePointsEnd - sideIndex
        : this.sides[side].circlePointsStart + sideIndex;

      const nextPoint = this.circle.getPoint(nextPointIndex);
      this.ctx.lineTo(...nextPoint);

      prevCirclePoint = this.circle.getPoint(
        isPrevSide
          ? this.sides[prevSide].circlePointsEnd - sideIndex + 1
          : this.sides[side].circlePointsStart + sideIndex - 1
      );

      this.ctx.lineTo(...prevCirclePoint);

      this.ctx.stroke();
      isPrevSide = !isPrevSide;
      yield;
    }
  }

  *drawRing() {
    if (!this.renderRing) {
      return;
    }

    const { n } = this.circle.config;
    const { ringColor } = this.config;

    let prevPoint;
    let prevPointIndex = 0;
    let isPrevSide = false;
    this.ctx.strokeStyle = ringColor;
    for (let i = 0; i < n; i++) {
      this.ctx.beginPath();
      if (!prevPoint) {
        prevPoint = this.circle.getPoint(0);
      }

      this.ctx.moveTo(...prevPoint);
      prevPointIndex = isPrevSide ? i : prevPointIndex + this.ringDistance;
      prevPoint = this.circle.getPoint(prevPointIndex);

      this.ctx.lineTo(...prevPoint);

      if (i < n - 1) {
        prevPointIndex++;
        prevPoint = this.circle.getPoint(prevPointIndex);
        this.ctx.lineTo(...prevPoint);
      }

      this.ctx.stroke();

      yield;

      isPrevSide = !isPrevSide;
    }
  }

  *generateStrings() {
    yield* this.drawCircle();
    yield* this.drawRing();
    yield* this.drawStar();
  }

  drawNails() {
    this.circle.drawNails(this.nails);

    for (const { point, side, sideIndex } of this.generateStarPoints()) {
      this.nails.addNail({
        point,
        number: sideIndex ? `${side}_${sideIndex}` : 0,
      });
    }

    this.circle.drawNails(this.nails);
  }

  getStepCount() {
    const { sides, sideNails, ringSize } = this.config;
    const starCount = sideNails * sides;
    return starCount * (3 + (ringSize ? 1 : 0)); // Once for each side + two more times for the side's circle
  }

  static thumbnailConfig = {
    sideNails: 18,
  };
}
