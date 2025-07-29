import { compareObjects } from './objects.js';

export default class StarShape {
  constructor(config) {
    this.setConfig(config);
  }

  #getCalc({ radius, sides, sideNails, rotation }) {
    const nailSpacing = radius / sideNails;
    const sidesAngle = (Math.PI * 2) / sides;
    const rotationAngle = rotation ? -PI2 * rotation : 0;

    return {
      sideAngle: sidesAngle,
      nailSpacing,
      starCenterStart: (sideNails % 1) * nailSpacing,
      sides: new Array(sides).fill(null).map((_, side) => {
        const sideAngle = side * sidesAngle + rotationAngle;
        const circlePointsStart = side * sideNails;

        return {
          sinSideAngle: Math.sin(sideAngle),
          cosSideAngle: Math.cos(sideAngle),
          circlePointsStart,
          circlePointsEnd: circlePointsStart + sideNails,
        };
      }),
    };
  }

  getPoint(side = 0, index = 0) {
    const radius = this.calc.starCenterStart + index * this.calc.nailSpacing;
    const { sinSideAngle, cosSideAngle } = this.calc.sides[side];
    const [centerX, centerY] = this.center;

    return [centerX + sinSideAngle * radius, centerY + cosSideAngle * radius];
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
            : sideIndex
            ? `${side}_${sideIndex}`
            : 0,
        });
      }
    }
  }

  *draw(renderer) {
    const { sideNails, sides } = this.config;

    let alternate = false;
    const linesPerRound = sides % 2 ? sides * 2 : sides;
    const rounds = sides % 2 ? Math.floor(sideNails / 2) : sideNails;

    let prevPointIndex = 0;
    let prevPoint = this.getPoint(0, prevPointIndex);

    for (let round = 0; round <= rounds; round++) {
      let side = 0;

      const linesPerThisRound = linesPerRound - (round === rounds ? sides : 0);

      for (let i = 0; i < linesPerThisRound; i++) {
        side = side !== sides - 1 ? side + 1 : 0;
        alternate = !alternate;
        prevPointIndex = alternate ? sideNails - round : round;
        const nextPoint = this.getPoint(side, prevPointIndex);
        renderer.renderLines(prevPoint, nextPoint);
        prevPoint = nextPoint;
        yield;
      }

      prevPointIndex = alternate ? prevPointIndex - 1 : prevPointIndex + 1;
      const nextPoint = this.getPoint(0, prevPointIndex);
      renderer.renderLines(prevPoint, nextPoint);
      prevPoint = nextPoint;
    }
  }

  getStepCount() {
    const { sides, sideNails } = this.config;

    return sides * sideNails;
  }

  static nailsConfig = Object.freeze({
    key: 'sideNails',
    label: 'Nails per side',
    defaultValue: 40,
    type: 'range',
    attr: { min: 1, max: 200, step: 1 },
  });

  static sidesConfig = Object.freeze({
    key: 'sides',
    label: 'Sides',
    defaultValue: 3,
    type: 'range',
    attr: { min: 3, max: 20, step: 1 },
  });
}
