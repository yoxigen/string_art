import StringArt from '../infra/StringArt';
import Polygon from '../shapes/Polygon';
import Color from '../helpers/color/Color';
import { ColorConfig } from '../helpers/color/color.types';
import {
  combineBoundingRects,
  getBoundingRectAspectRatio,
} from '../helpers/size_utils';
import Renderer from '../infra/renderers/Renderer';
import { ControlsConfig } from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import { Dimensions } from '../types/general.types';
import { createArray } from '../helpers/array_utils';
import INails from '../infra/nails/INails';

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
        max: 20,
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
        min: 2,
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

  getCalc({ size }: CalcOptions): TCalc {
    const { n, rotation, sides, layers, margin } = this.config;

    const layerAngleShift = 1 / (sides * layers);

    const polygons = createArray(
      layers,
      i =>
        new Polygon({
          sides,
          rotation: rotation / sides + i * layerAngleShift,
          margin,
          size,
          nailsPerSide: n,
          radiusNailsCountSameAsSides: true,
          drawCenter: true,
          drawCenterNail: i === 0,
        })
    );

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
  }

  getAspectRatio(): number {
    const calc = this.calc ?? this.getCalc({ size: [100, 100] });
    const boundingRect = combineBoundingRects(
      ...calc.polygons.map(p => p.getBoundingRect())
    );
    return getBoundingRectAspectRatio(boundingRect);
  }

  *drawStrings(renderer: Renderer) {
    const { sides, layers, n } = this.config;

    let step = 0;

    for (let layer = 0; layer < layers; layer++) {
      renderer.setColor(this.color.getColor(layer));
      const polygon = this.calc.polygons[layer];

      for (let side = 0; side < sides; side++) {
        const leftSide = (side + 1) % sides;

        for (let index = 0; index < n; index++) {
          const centerIndexes = [index, this.config.n - index - 1];

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

  drawNails(nails: INails) {
    const layerNailCount =
      this.config.layers > 1 ? this.calc.polygons[1].getNailsCount() : null;

    this.calc.polygons.forEach((polygon, i) =>
      polygon.drawNails(nails, {
        getUniqueKey: i ? k => i * layerNailCount + 1 + k : undefined,
      })
    );
  }

  getStepCount(): number {
    const { sides, n, layers } = this.config;
    return sides * n * 2 * layers;
  }

  getNailCount(size: Dimensions): number {
    const { layers } = this.config;
    const calc = this.calc ?? this.getCalc({ size });
    const polygon = calc.polygons[0];

    return (
      layers *
        polygon.getNailsCount({ drawCenter: true, drawCenterNail: false }) +
      1
    );
  }

  thumbnailConfig = ({ n }) => ({
    n: Math.min(n, 20),
  });

  testStepCountConfig = [
    {
      sides: 3,
      n: 2,
      layers: 1,
    },
  ];
}
