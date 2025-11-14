import StringArt from '../infra/StringArt';
import Polygon from '../shapes/Polygon';
import Color from '../helpers/color/Color';
import { ColorConfig } from '../helpers/color/color.types';
import {
  combineBoundingRects,
  getBoundingRectAspectRatio,
} from '../helpers/size_utils';
import { ControlsConfig } from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import { Dimensions } from '../types/general.types';
import { createArray } from '../helpers/array_utils';
import NailsSetter from '../infra/nails/NailsSetter';
import Controller from '../infra/Controller';

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
    let totalNailsCount = 0;

    const polygons = createArray(layers, i => {
      const layerIndexStart = totalNailsCount;

      const polygon = new Polygon({
        sides,
        rotation: rotation / sides + i * layerAngleShift,
        margin,
        size,
        nailsPerSide: n,
        radiusNailsCountSameAsSides: true,
        drawCenter: true,
        drawCenterNail: i === 0,
        getUniqueKey: i === 0 ? undefined : k => layerIndexStart + k,
      });

      totalNailsCount += polygon.getNailsCount();
      return polygon;
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
  }

  getAspectRatio(): number {
    const calc = this.calc ?? this.getCalc({ size: [100, 100] });
    const boundingRect = combineBoundingRects(
      ...calc.polygons.map(p => p.getBoundingRect())
    );
    return getBoundingRectAspectRatio(boundingRect);
  }

  *drawStrings(controller: Controller) {
    const { sides, layers, n } = this.config;

    for (let layer = 0; layer < layers; layer++) {
      controller.startLayer({
        color: this.color.getColor(layer),
        name: String(layer),
      });
      const polygon = this.calc.polygons[layer];

      let alternate = false;

      controller.goto(0);

      for (let side = 0; side < sides; side++) {
        const prevSide = side === 0 ? sides - 1 : side - 1;
        const nextSide = (side + 1) % sides;

        controller.stringTo(polygon.getSideNailIndex(prevSide, 0));
        yield;

        controller.stringTo(polygon.getSideNailIndex(side, 0));

        yield;

        controller.stringTo(polygon.getSideNailIndex(nextSide, 0));

        yield;

        for (let index = 1; index < n - 1; index++) {
          controller.stringTo(
            polygon.getSideNailIndex(
              alternate ? prevSide : side,
              alternate ? index : n - index - 1
            )
          );

          yield;

          controller.stringTo(polygon.getCenterNailIndex(side, n - index - 1));

          yield;

          controller.stringTo(
            polygon.getSideNailIndex(
              alternate ? side : prevSide,
              alternate ? n - index - 1 : index
            )
          );

          yield;

          alternate = !alternate;
        }
      }
    }
  }

  drawNails(nails: NailsSetter) {
    this.calc.polygons.forEach((polygon, i) => {
      polygon.drawNails(nails);
    });
  }

  getStepCount(): number {
    const { sides, n, layers } = this.config;
    return layers * sides * (3 + 3 * (n - 2));
  }

  getNailCount(size: Dimensions): number {
    const { layers } = this.config;
    const calc = this.calc ?? this.getCalc({ size });
    const polygon = calc.polygons[0];

    return layers * (polygon.getNailsCount() - 1) + 1;
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
