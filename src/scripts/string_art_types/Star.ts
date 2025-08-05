import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';
import StarShape from '../helpers/StarShape.js';
import { withoutAttribute } from '../helpers/config_utils.js';

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
    StarShape.centerRadiusConfig,
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
    withoutAttribute(Circle.rotationConfig, 'snap'),
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

  #star = null;

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
      rotation: rotation ? rotation / sides : 0,
      distortion,
    };

    if (this.circle) {
      this.circle.setConfig(circleConfig);
    } else {
      this.circle = new Circle(circleConfig);
    }

    const starConfig = {
      ...this.config,
      radius: this.circle.radius,
      size: this.size,
    };

    if (this.#star) {
      this.#star.setConfig(starConfig);
    } else {
      this.#star = new StarShape(starConfig);
    }
  }

  getArcPoint({ side, sideIndex }) {
    return this.circle.getPoint(side * this.config.sideNails + sideIndex);
  }

  *drawStar() {
    const { innerColor } = this.config;

    this.renderer.setColor(innerColor);
    yield* this.#star.generateStrings(this.renderer);
  }

  *drawCircle() {
    const { outterColor, sides, sideNails } = this.config;
    this.renderer.setColor(outterColor);

    let prevPoint = this.#star.getPoint(0, 0);
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
          sideIndex: alternate ? sideNails - round - 1 : round,
        };

        const nextPoint = isStar
          ? this.#star.getPoint(pointPosition.side, pointPosition.sideIndex)
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
      prevPoint = this.#star.getPoint(0, round + 1);
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
    this.#star.drawNails(this.nails);
    this.circle.drawNails(this.nails);
  }

  #getCircleStepCount() {
    const { sides, sideNails } = this.config;
    const circleRounds = sides % 2 ? Math.ceil(sideNails / 2) : sideNails;
    const linesPerRound = sides % 2 ? sides * 4 : sides * 2;

    return (circleRounds + 1) * linesPerRound - sides * 2;
  }

  getStepCount() {
    const { sides, sideNails, ringSize } = this.config;

    const ringCount = ringSize ? sideNails * sides : 0;
    const circleCount = this.#getCircleStepCount();
    const starCount = StarShape.getStepCount(this.config);
    return circleCount + ringCount + starCount;
  }

  static thumbnailConfig = {
    sideNails: 18,
  };
}
