const PI2 = Math.PI * 2;

export default class Polygon {
  constructor(config) {
    this.setConfig(config);
  }

  setConfig(config) {
    const serializedConfig = this._serializeConfig(config);
    if (serializedConfig !== this.serializedConfig) {
      const {
        size: configSize,
        margin,
        rotation = 0,
        sides: sideCount,
      } = (this.config = config);

      const sideAngle = PI2 / sideCount;

      const sides = new Array(sideCount).fill(null).map((_, i) => {
        const angle = sideAngle * i + PI2 * rotation;
        const radiusAngle = -sideAngle * (i - 0.5) - PI2 * rotation;

        return {
          cos: Math.cos(angle),
          sin: Math.sin(angle),
          center: {
            cos: Math.cos(radiusAngle),
            sin: Math.sin(radiusAngle),
          },
        };
      });

      Object.assign(this, {
        sides,
        sideCount,
        sideAngle,
      });

      if (this.points) {
        this.points.clear();
      } else {
        this.points = new Map();
      }

      Object.assign(this, this._getProps());

      if (config.fitSize) {
        const boundingRect = this.getBoundingRect();
        const scale = Math.min(
          (configSize[0] - 2 * margin) / boundingRect.width,
          (configSize[1] - 2 * margin) / boundingRect.height
        );

        const size = configSize.map(v => v * scale);
        const center = [
          this.center[0] -
            (scale * (boundingRect.left - configSize[0] + boundingRect.right)) /
              2,
          this.center[1] -
            (scale * (boundingRect.top - configSize[1] + boundingRect.bottom)) /
              2,
        ];
        Object.assign(this, this._getProps({ size, center }));

        this.points.clear();
      }
    }
  }

  _getProps(overrideConfig) {
    const {
      nailsSpacing,
      size,
      margin = 0,
      center: configCenter,
    } = Object.assign({}, this.config, overrideConfig);

    const center = configCenter ?? this.config.size.map(v => v / 2);

    const radius = Math.min(...size) / 2 - margin;
    const sideSize = 2 * radius * Math.sin(this.sideAngle / 2);
    const start = [
      radius * Math.sin(this.sideAngle / 2),
      radius * Math.cos(this.sideAngle / 2),
    ];
    const nailsDistance = sideSize * nailsSpacing;
    const radiusNailsCount = Math.floor(radius / nailsDistance);
    const radiusNailsDistance = radius / radiusNailsCount;

    return {
      nailsSpacing,
      nailsPerSide: 1 / nailsSpacing,
      center,
      radius,
      sideSize,
      start,
      nailsDistance,
      radiusNailsCount,
      radiusNailsDistance,
    };
  }

  _serializeConfig({ size, margin = 0, rotation = 0, center, sides }) {
    return [size?.join(','), center?.join(','), sides, margin, rotation].join(
      '_'
    );
  }

  getSidePoint({ side, index }) {
    const pointsMapIndex = [side, index].join('_');

    if (this.points.has(pointsMapIndex)) {
      return this.points.get(pointsMapIndex);
    }

    const startX = this.start[0] - index * this.nailsDistance;
    const { cos, sin } = this.sides[side];

    const point = [
      cos * startX - sin * this.start[1] + this.center[0],
      sin * startX + cos * this.start[1] + this.center[1],
    ];

    this.points.set(pointsMapIndex, point);
    return point;
  }

  getCenterPoint({ side, index }) {
    const radius = index * this.radiusNailsDistance;
    const { sin, cos } = this.sides[side].center;

    return [this.center[0] + sin * radius, this.center[1] + cos * radius];
  }

  getBoundingRect() {
    const points = this.sides.map((_, side) =>
      this.getSidePoint({ side, index: 0 })
    );
    const firstPoint = points[0];

    const boundingRect = points.slice(1).reduce(
      (boundingRect, [x, y]) => ({
        left: Math.min(boundingRect.left, x),
        right: Math.max(boundingRect.right, x),
        top: Math.min(boundingRect.top, y),
        bottom: Math.max(boundingRect.bottom, y),
      }),
      {
        left: firstPoint[0],
        right: firstPoint[0],
        top: firstPoint[1],
        bottom: firstPoint[1],
      }
    );

    boundingRect.height = boundingRect.bottom - boundingRect.top;
    boundingRect.width = boundingRect.right - boundingRect.left;
    Object.freeze(boundingRect);
    return boundingRect;
  }

  drawNails(nails, { drawCenter = false, drawSides = true } = {}) {
    for (let side = 0; side < this.sideCount; side++) {
      const sideIndexStart = side * this.nailsPerSide;

      if (drawSides) {
        for (let index = 0; index < this.nailsPerSide; index++) {
          nails.addNail({
            point: this.getSidePoint({ side, index }),
            number: sideIndexStart + index,
          });
        }
      }

      if (drawCenter) {
        for (let index = 0; index < this.radiusNailsCount; index++) {
          nails.addNail({
            point: this.getCenterPoint({ side, index }),
            number: `${side}_${index}`,
          });
        }
      }
    }
  }
}
