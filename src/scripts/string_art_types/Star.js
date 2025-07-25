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
    Circle.distortionConfig,
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
          defaultValue: '#2ec0ff',
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

    const { sides, rotation, distortion, sideNails, margin = 0 } = this.config;
    const circleConfig = {
      size: this.size,
      n: sideNails * sides,
      margin,
      rotation,
      distortion,
    };

    if (this.circle) {
      this.circle.setConfig(circleConfig);
    } else {
      this.circle = new Circle(circleConfig);
    }

    this.sideAngle = (Math.PI * 2) / sides;
    this.nailSpacing = this.circle.radius / sideNails;
    this.starCenterStart = (sideNails % 1) * this.nailSpacing;

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

  getArcPoint({ side, sideIndex }) {
    return this.circle.getPoint(side * this.config.sideNails + sideIndex);
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
    const { innerColor, sideNails, sides } = this.config;

    this.renderer.setColor(innerColor);
    let alternate = false;
    const linesPerRound = sides % 2 ? sides * 2 : sides;
    const rounds = sides % 2 ? Math.floor(sideNails / 2) : sideNails;

    let prevPointIndex = 0;
    let prevPoint = this.getStarPoint({ side: 0, sideIndex: prevPointIndex });

    for (let round = 0; round <= rounds; round++) {
      let side = 0;

      const linesPerThisRound = linesPerRound - (round === rounds ? sides : 0);

      for (let i = 0; i < linesPerThisRound; i++) {
        side = side !== sides - 1 ? side + 1 : 0;
        alternate = !alternate;
        prevPointIndex = alternate ? sideNails - round : round;
        const nextPoint = this.getStarPoint({
          side,
          sideIndex: prevPointIndex,
        });
        this.renderer.renderLines(prevPoint, nextPoint);
        prevPoint = nextPoint;
        yield;
      }

      prevPointIndex = alternate ? prevPointIndex - 1 : prevPointIndex + 1;
      const nextPoint = this.getStarPoint({
        side: 0,
        sideIndex: prevPointIndex,
      });
      this.renderer.renderLines(prevPoint, nextPoint);
      prevPoint = nextPoint;
    }
  }

  *drawCircle() {
    const { outterColor, sides, sideNails } = this.config;
    this.renderer.setColor(outterColor);

    let prevPoint = this.getStarPoint({ side: 0, sideIndex: 0 });
    let alternate = false;
    let isStar = false;

    const rounds = sides % 2 ? Math.ceil(sideNails / 2) : sideNails;
    let side = 0;
    const linesPerRound = sides % 2 ? sides * 4 : sides * 2;

    for (let round = 0; round <= rounds; round++) {
      const linesPerThisRound =
        linesPerRound - (round === rounds ? sides * 2 : 0);

      for (let i = 0; i < linesPerThisRound; i++) {
        const pointPosition = {
          side,
          sideIndex: alternate ? sideNails - round : round,
        };

        const nextPoint = isStar
          ? this.getStarPoint(pointPosition)
          : this.getArcPoint(pointPosition);

        this.renderer.renderLines(prevPoint, nextPoint);
        prevPoint = nextPoint;

        yield;
        isStar = !isStar;

        if (isStar) {
          side = side !== sides - 1 ? side + 1 : 0;
          alternate = !alternate;
        }
      }
      prevPoint = this.getStarPoint({ side: 0, sideIndex: round + 1 });
    }
  }

  *generateStrings() {
    yield* this.drawCircle();

    const { ringSize, ringColor } = this.config;

    if (ringSize !== 0) {
      yield* this.circle.drawRing(this.renderer, {
        ringSize,
        color: ringColor,
      });
    }
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
    const ringCount = ringSize ? sideNails * sides : 0;
    const starAndCircleCount = 3 * sides * (sideNails + (sides % 2 ? 1 : 0));

    return starAndCircleCount + ringCount;
  }

  static thumbnailConfig = {
    sideNails: 18,
  };
}
