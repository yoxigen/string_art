export default class StarShape {
  constructor(config) {
    this.setConfig(config);
  }

  #getCalc({ radius, sides, sideNails, rotation }) {
    const nailSpacing = radius / sideNails;
    const sideAngle = (Math.PI * 2) / sides;
    const rotationAngle = rotation ? -PI2 * rotation : 0;

    return {
      sideAngle,
      nailSpacing,
      starCenterStart: (sideNails % 1) * nailSpacing,
      side: new Array(sides).fill(null).map((_, side) => {
        const sideAngle = side * sideAngle + rotationAngle;
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
    const center = config.center ?? config.size.map(v => v / 2);

    this.config = config;
    this.center = center;
    this.calc = this.#getCalc(config);
  }

  #serializeConfig() {}

  /**
   * Given a Nails instance, uses it to draw the nails of this Circle
   * @param {Nails} nails
   * @param {{nailsNumberStart?: number, getNumber?: Function}} param1
   */
  drawNails(nails, { nailsNumberStart = 0, getNumber } = {}) {
    for (let i = 0; i < this.config.n; i++) {
      nails.addNail({
        point: this.getPoint(i),
        number: getNumber ? getNumber(i) : i + nailsNumberStart,
      });
    }
  }

  *drawStar(renderer, { starSize, color }) {}

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
