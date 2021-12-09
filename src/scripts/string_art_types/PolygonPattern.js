import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';
import Polygon from '../helpers/Polygon.js';
import Color from '../helpers/Color.js';

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#ff0000',
    multicolorRange: 1,
    multicolorStart: 0,
    multicolorByLightness: true,
    minLightness: 20,
    maxLightness: 50,
  },
  exclude: ['colorCount'],
});

export default class PolygonPattern extends StringArt {
  name = 'Polygon';
  id = 'polygon';
  controls = [
    {
      key: 'sides',
      label: 'Sides',
      defaultValue: 5,
      type: 'range',
      attr: {
        min: 3,
        max: 10,
        step: 1,
      },
    },
    {
      key: 'n',
      label: 'Nails per side',
      defaultValue: 60,
      type: 'range',
      attr: {
        min: 1,
        max: 100,
        step: 1,
      },
    },
    {
      key: 'bezier',
      label: 'Bezier',
      defaultValue: 2,
      type: 'range',
      attr: {
        min: 1,
        max: 4,
        step: 1,
      },
      show: ({ sides }) => sides > 4,
    },
    Circle.rotationConfig,
    COLOR_CONFIG,
  ];

  setUpDraw() {
    super.setUpDraw();
    const { n, rotation, sides, margin, isMultiColor } = this.config;
    const size = this.getSize();

    const polygonConfig = {
      sides,
      rotation,
      margin,
      size,
      nailsSpacing: 1 / n,
      fitSize: true,
    };

    if (this.polygon) {
      this.polygon.setConfig(polygonConfig);
    } else {
      this.polygon = new Polygon(polygonConfig);
    }

    this.color = new Color({
      ...this.config,
      isMultiColor,
      colorCount: sides,
    });

    if (isMultiColor) {
      this.colorMap = this.color.getColorMap({
        stepCount: this.getStepCount(),
        colorCount: sides,
      });
    } else {
      this.colorMap = null;
    }
  }

  *generateStrings() {
    const { sides, bezier } = this.config;
    const limitedBezier = Math.min(bezier, Math.ceil(sides / 2) - 1);

    let step = 0;
    let color = this.color.getColor(0);

    for (let side = 0; side < sides; side++) {
      const nextSide = (side + limitedBezier) % sides;

      for (let index = 0; index < this.polygon.nailsPerSide; index++) {
        if (this.colorMap) {
          color = this.colorMap.get(step);
        }

        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(...this.polygon.getSidePoint({ side, index }));
        this.ctx.lineTo(
          ...this.polygon.getSidePoint({ side: nextSide, index })
        );

        this.ctx.stroke();

        yield;
        step++;
      }
    }
  }

  getStepCount() {
    const { sides, n } = this.config;
    return sides * n;
  }

  drawNails() {
    this.polygon.drawNails(this.nails);
  }

  static thumbnailConfig = {
    n: 20,
  };
}
