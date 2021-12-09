import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';
import Polygon from '../helpers/Polygon.js';
import Color from '../helpers/Color.js';

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#29f1ff',
    multicolorRange: 264,
    multicolorStart: 53,
    multicolorByLightness: false,
    minLightness: 30,
    maxLightness: 70,
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
      colorCount: layers,
    });

    if (isMultiColor) {
      this.colorMap = this.color.getColorMap({
        stepCount: this.getStepCount(),
        colorCount: layers,
      });
    } else {
      this.colorMap = null;
    }
  }

  *generateStrings() {
    const { sides, bezier, layers } = this.config;

    let step = 0;
    let color = this.color.getColor(0);

    for (let layer = 0; layer < layers; layer++) {
      const polygon = this.polygons[layer];

      for (let side = 0; side < sides; side++) {
        const leftSide = side === sides - 1 ? 0 : side + 1;

        for (let index = 0; index <= polygon.nailsPerSide; index++) {
          if (this.colorMap) {
            color = this.colorMap.get(step);
          }

          const centerIndexes = this.getCenterIndexes({
            polygon,
            sideIndex: index,
          });

          this.ctx.strokeStyle = color;
          this.ctx.beginPath();
          this.ctx.moveTo(...polygon.getSidePoint({ side, index }));
          this.ctx.lineTo(
            ...polygon.getCenterPoint({
              side: side,
              index: centerIndexes[0],
            })
          );
          this.ctx.moveTo(...polygon.getSidePoint({ side, index }));
          this.ctx.lineTo(
            ...polygon.getCenterPoint({
              side: leftSide,
              index: centerIndexes[1],
            })
          );

          this.ctx.stroke();

          yield;
          step++;
        }
      }
    }
  }

  getCenterIndexes({ polygon, sideIndex }) {
    const extraNailCount = polygon.nailsPerSide - polygon.radiusNailsCount;

    return [
      sideIndex < extraNailCount
        ? -extraNailCount + sideIndex
        : sideIndex - extraNailCount,
      polygon.radiusNailsCount - sideIndex,
    ];
  }

  getStepCount() {
    const { sides, n, layers } = this.config;
    return sides * (n + 1) * layers;
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
