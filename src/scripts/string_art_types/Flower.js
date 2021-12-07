import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';
import Polygon from '../helpers/Polygon.js';
import Color from '../helpers/Color.js';

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#ffbb29',
    multicolorRange: 76,
    multicolorStart: 0,
    multicolorByLightness: false,
    minLightness: 0,
    maxLightness: 100,
  },
  exclude: ['colorCount'],
});

export default class Flower extends StringArt {
  name = 'Flower';
  id = 'flower';
  link = 'https://www.sqrt.ch/Buch/fadenmodell4_100.svg';
  controls = [
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
      key: 'sides',
      label: 'Sides',
      defaultValue: 4,
      type: 'range',
      attr: {
        min: 3,
        max: 10,
        step: 1,
      },
    },
    {
      key: 'layers',
      label: 'Layers',
      defaultValue: 2,
      type: 'range',
      attr: {
        min: 1,
        max: 10,
        step: 1,
      },
    },
    Circle.rotationConfig,
    COLOR_CONFIG,
  ];

  setUpDraw() {
    super.setUpDraw();
    const { n, rotation, sides, layers, margin, isMultiColor } = this.config;
    const size = this.getSize();

    const layerAngleShift = 1 / (sides * layers);

    this.polygons = new Array(layers).fill(null).map((_, i) => {
      const polygonConfig = {
        sides,
        rotation: rotation + i * layerAngleShift,
        margin,
        size,
        nailsSpacing: 1 / n,
      };

      return new Polygon(polygonConfig);
    });

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

    let step = 0;
    let color = this.color.getColor(0);

    for (let layer = 0; layer < this.polygons.length; layer++) {
      const polygon = this.polygons[layer];

      for (let side = 0; side < sides; side++) {
        for (let centerSide = side; centerSide <= side + 1; centerSide++) {
          const currentCenterSide = centerSide >= sides - 1 ? 0 : centerSide;

          for (let index = 0; index < polygon.nailsPerSide; index++) {
            if (this.colorMap) {
              color = this.colorMap.get(step);
            }

            this.ctx.strokeStyle = color;
            this.ctx.beginPath();
            this.ctx.moveTo(...polygon.getSidePoint({ side, index }));
            this.ctx.lineTo(
              ...polygon.getCenterPoint({
                side: currentCenterSide,
                index: -index,
              })
            );

            this.ctx.stroke();

            yield;
            step++;
          }
        }
      }
    }
  }

  getStepCount() {
    const { sides, n, layers } = this.config;
    return sides * n * layers * 2;
  }

  drawNails() {
    this.polygons.forEach(polygon =>
      polygon.drawNails(this.nails, { drawCenter: true })
    );
  }

  static thumbnailConfig = {
    n: 20,
  };
}
