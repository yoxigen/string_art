import { compareObjects } from './objects.js';
import { formatFractionAsPercent } from './string_utils.js';

export default class StarShape {
  constructor(config) {
    this.setConfig(config);
  }

  #getCalc({
    radius,
    sides,
    sideNails,
    rotation,
    centerRadius: centerRadiusFraction = 0,
    maxCurveSize = 1,
  }) {
    const centerRadius = radius * centerRadiusFraction;
    const nailSpacing = (radius - centerRadius) / (sideNails - 1); // The distance between nails on the same side, in px
    const sidesAngle = (Math.PI * 2) / sides; // The angle, in radians, between each side
    const rotationAngle = rotation ? (-Math.PI * 2 * rotation) / sides : 0;

    return {
      sideAngle: sidesAngle,
      nailSpacing,
      centerRadius,
      sidesConnectionCount: Math.floor(Math.min(1, maxCurveSize) * sideNails),
      sideSize: radius - centerRadius,
      sides: new Array(sides).fill(null).map((_, side) => {
        const sideAngle = side * sidesAngle + rotationAngle;

        return {
          sinSideAngle: Math.sin(sideAngle),
          cosSideAngle: Math.cos(sideAngle),
        };
      }),
    };
  }

  getPoint(side = 0, index = 0) {
    const radius = this.calc.centerRadius + index * this.calc.nailSpacing;
    const { sinSideAngle, cosSideAngle } = this.calc.sides[side];

    return [
      this.center[0] + sinSideAngle * radius,
      this.center[1] + cosSideAngle * radius,
    ];
  }

  setConfig(config) {
    if (
      compareObjects(config, this.config, [
        'radius',
        'sides',
        'sideNails',
        'rotation',
        'center',
        'size',
        'centerRadius',
        'maxCurveSize',
      ])
    ) {
      return;
    }

    const center = config.center ?? config.size.map(v => v / 2);

    this.config = config;
    this.center = center;
    this.calc = this.#getCalc(config);
  }

  /**
   * Given a Nails instance, uses it to draw the nails of this Circle
   * @param {Nails} nails
   * @param {{nailsNumberStart?: number, getNumber?: Function}} param1
   */
  drawNails(nails, { getNumber, reverseOrder } = {}) {
    const { sides, sideNails } = this.config;

    for (let side = 0; side < sides; side++) {
      for (let i = 0; i < sideNails; i++) {
        const sideIndex = reverseOrder ? sideNails - i : i;
        nails.addNail({
          point: this.getPoint(side, sideIndex),
          number: getNumber
            ? getNumber(side, sideIndex)
            : sideIndex || this.config.centerRadius
            ? `${side}_${sideIndex}`
            : 0,
        });
      }
    }
  }

  // In this pattern, strings are connected in a "merry-go-round" way, around the star.
  // With even sides count, the strings go around the star once, while with odd sides count, each round goes twice around the star.
  // The threading is: star at the center, then next side at the edge (outtermost nail), then back to the center for the next side,
  // until all sides have been connected both center and edge (for odd-side-count stars) or until all sides have been connected (for odd-side-count)
  // Then move up one nail from the center and start another round.
  *generateStrings(renderer, { size } = {}) {
    const { sideNails: sideNailsConfig, sides } = this.config;
    const { sidesConnectionCount } = this.calc;

    const sideNails = size
      ? Math.max(1, Math.min(Math.floor(size), sideNailsConfig))
      : sideNailsConfig;

    const minNailIndex = Math.max(0, sideNails - sidesConnectionCount);

    let alternate = false;

    const rounds =
      sides % 2
        ? Math.ceil(Math.min(sideNails, sidesConnectionCount) / 2)
        : sideNails - minNailIndex;

    let prevPointIndex = minNailIndex;
    let prevPoint = this.getPoint(0, prevPointIndex);

    for (let round = 0; round < rounds; round++) {
      const isLastRound = round === rounds - 1;
      let side = 0;

      const linesThisRound = sides % 2 ? sides * 2 : sides;

      for (let i = 0; i < linesThisRound; i++) {
        side = (side + 1) % sides;
        alternate = !alternate;
        prevPointIndex = alternate
          ? sideNails - round - 1
          : round + minNailIndex;
        const nextPoint = this.getPoint(side, prevPointIndex);
        renderer.renderLines(prevPoint, nextPoint);
        prevPoint = nextPoint;
        yield;
      }

      if (!isLastRound) {
        prevPointIndex = alternate ? prevPointIndex - 1 : prevPointIndex + 1;
        const nextPoint = this.getPoint(0, prevPointIndex);
        renderer.renderLines(prevPoint, nextPoint);
        prevPoint = nextPoint;
      }
    }
  }

  getStepCount(size) {
    return StarShape.getStepCount(this.config, { size });
  }

  static getStepCount({ sides, sideNails: sideNailsConfig }, { size } = {}) {
    const sideNails = size
      ? Math.min(Math.floor(size), sideNailsConfig)
      : sideNailsConfig;

    const rounds = sides % 2 ? Math.ceil(sideNails / 2) : sideNails;
    const linesPerRound = sides % 2 ? sides * 2 : sides;
    return rounds * linesPerRound;
  }

  static nailsConfig = Object.freeze({
    key: 'sideNails',
    label: 'Nails per side',
    defaultValue: 40,
    type: 'range',
    attr: { min: 1, max: 200, step: 1 },
    isStructural: true,
  });

  static sidesConfig = Object.freeze({
    key: 'sides',
    label: 'Sides',
    defaultValue: 3,
    type: 'range',
    attr: { min: 3, max: 20, step: 1 },
    isStructural: true,
  });

  static maxCurveSize = Object.freeze({
    key: 'maxCurveSize',
    label: 'Max curve size',
    description:
      'The maximum number of connections used to create a curve between two sides.',
    defaultValue: 1,
    type: 'range',
    displayValue: ({ maxCurveSize, sideNails }) =>
      Math.floor(maxCurveSize * sideNails),
    attr: {
      min: 0,
      max: 1,
      step: ({ config: { sideNails } }) => 1 / sideNails,
    },
    isStructural: true,
  });

  static centerRadiusConfig = Object.freeze({
    key: 'centerRadius',
    label: 'Center radius',
    defaultValue: 0,
    type: 'range',
    attr: {
      min: 0,
      max: ({ config: { sideNails } }) => (sideNails - 1) / sideNails,
      step: 0.01,
    },
    displayValue: ({ centerRadius }) => formatFractionAsPercent(centerRadius),
    isStructural: true,
  });

  static rotationConfig = Object.freeze({
    key: 'rotation',
    label: 'Rotation',
    defaultValue: 0,
    type: 'range',
    attr: {
      min: 0,
      max: 1,
      step: 0.01,
    },
    displayValue: (config, { key }) => `${Math.round(config[key] * 360)}°`,
    isStructural: true,
    affectsStepCount: false,
  });

  static StarConfig = Object.freeze([
    StarShape.nailsConfig,
    StarShape.sidesConfig,
    StarShape.centerRadiusConfig,
    StarShape.maxCurveSize,
    StarShape.rotationConfig,
  ]);
}
