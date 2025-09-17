import StringArt from '../StringArt';
import Polygon from '../shapes/Polygon';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorMap } from '../helpers/color/color.types';
import {
  combineBoundingRects,
  getBoundingRectAspectRatio,
} from '../helpers/size_utils';
import Renderer from '../renderers/Renderer';
import { ControlsConfig } from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';

export interface FlowerConfig extends ColorConfig {
  sides: number;
  n: number;
  layers: number;
  rotation: number;
}

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#29f1ff',
    multicolorRange: 132,
    multicolorStart: 53,
    multicolorByLightness: false,
    minLightness: 30,
    maxLightness: 70,
  },
  exclude: ['colorCount'],
});

type TCalc = {
  polygons: ReadonlyArray<Polygon>;
};

export default class Flower extends StringArt<FlowerConfig, TCalc> {
  static type = 'flower';

  name = 'Flower';
  id = 'flower';
  link = 'https://www.sqrt.ch/Buch/fadenmodell4_100.svg';
  controls: ControlsConfig<FlowerConfig> = [
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
      isStructural: true,
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
      isStructural: true,
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
      isStructural: true,
    },
    Polygon.rotationConfig,
    COLOR_CONFIG,
  ];

  defaultValues = {
    nailsColor: '#29f1ff',
    nailRadius: 1,
    stringWidth: 0.5,
  };

  color: Color;
  colorMap: ColorMap;

  getCalc({ size }: CalcOptions): TCalc {
    const { n, rotation, sides, layers, margin } = this.config;

    const layerAngleShift = 1 / (sides * layers);

    const polygons = new Array(layers).fill(null).map((_, i) => {
      const polygonConfig = {
        sides,
        rotation: rotation / sides + i * layerAngleShift,
        margin,
        size,
        nailsSpacing: 1 / n,
      };

      return new Polygon(polygonConfig);
    });

    return { polygons };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    const { layers, isMultiColor } = this.config;

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

  getAspectRatio(calcOptions: CalcOptions): number {
    const calc = this.getCalc(calcOptions);
    const boundingRect = combineBoundingRects(
      ...calc.polygons.map(p => p.getBoundingRect())
    );
    return getBoundingRectAspectRatio(boundingRect);
  }

  *drawStrings(renderer: Renderer) {
    const { sides, layers } = this.config;

    let step = 0;
    renderer.setColor(this.color.getColor(0));

    for (let layer = 0; layer < layers; layer++) {
      const polygon = this.calc.polygons[layer];

      for (let side = 0; side < sides; side++) {
        const leftSide = side === sides - 1 ? 0 : side + 1;

        for (let index = 0; index <= polygon.nailsPerSide; index++) {
          if (this.colorMap?.has(step)) {
            renderer.setColor(this.colorMap.get(step));
          }

          const centerIndexes = this.getCenterIndexes({
            polygon,
            sideIndex: index,
          });

          renderer.renderLine(
            polygon.getCenterPoint({
              side: side,
              index: centerIndexes[0],
            }),
            polygon.getSidePoint({ side, index })
          );

          yield;

          renderer.lineTo(
            polygon.getCenterPoint({
              side: leftSide,
              index: centerIndexes[1],
            })
          );

          yield;
          step++;
        }
      }
    }
  }

  getCenterIndexes({
    polygon,
    sideIndex,
  }: {
    polygon: Polygon;
    sideIndex: number;
  }): [number, number] {
    const extraNailCount = polygon.nailsPerSide - polygon.radiusNailsCount;

    return [
      sideIndex < extraNailCount
        ? -extraNailCount + sideIndex
        : sideIndex - extraNailCount,
      polygon.radiusNailsCount - sideIndex,
    ];
  }

  getStepCount(): number {
    const { sides, n, layers } = this.config;
    return sides * (n + 1) * 2 * layers;
  }

  drawNails() {
    const firstNailIndex =
      this.calc.polygons[0].radiusNailsCount -
      this.calc.polygons[0].nailsPerSide;
    const filterCenterNails =
      firstNailIndex > 0 ? (_, index) => index >= firstNailIndex : null;

    this.calc.polygons.forEach(polygon =>
      polygon.drawNails(this.nails, { drawCenter: true, filterCenterNails })
    );
  }

  thumbnailConfig = ({ n }) => ({
    n: Math.min(n, 20),
  });
}
