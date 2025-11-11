import StringArt from '../infra/StringArt';
import Polygon, { PolygonConfig } from '../shapes/Polygon';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorMap } from '../helpers/color/color.types';
import Renderer from '../infra/renderers/Renderer';
import { Config, ControlsConfig } from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import NailsSetter from '../infra/nails/NailsSetter';

interface PolygonPatternConfig extends ColorConfig {
  sides: number;
  n: number;
  bezier: number;
  rotation: number;
}

interface TCalc {
  polygon: Polygon;
}

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

export default class PolygonPattern extends StringArt<
  PolygonPatternConfig,
  TCalc
> {
  static type = 'polygon';

  name = 'Polygon';
  id = 'polygon';
  controls: ControlsConfig<PolygonPatternConfig> = [
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
      affectsNails: false,
      affectsStepCount: false,
    },
    Polygon.rotationConfig,
    COLOR_CONFIG,
  ];

  defaultValues = {
    nailsColor: '#5c5c5c',
    nailRadius: 1,
  };

  color: Color;
  colorMap: ColorMap;

  getCalc({ size }: CalcOptions): TCalc {
    const { n, rotation, sides, margin } = this.config;

    const polygonConfig: PolygonConfig = {
      sides,
      rotation: rotation / (sides * 2),
      margin,
      size,
      nailsPerSide: n,
      fitSize: true,
    };

    return {
      polygon: new Polygon(polygonConfig),
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    const { sides, isMultiColor } = this.config;

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

  getAspectRatio(options: CalcOptions): number {
    const { polygon } = this.getCalc(options);
    return polygon.getAspectRatio();
  }

  *drawStrings(renderer: Renderer) {
    const { sides, bezier, n } = this.config;
    const limitedBezier = Math.min(bezier, Math.ceil(sides / 2) - 1);
    const polygon = this.calc.polygon;

    renderer.setColor(this.color.getColor(0));

    renderer.setStartingPoint(
      this.nails.getNailCoordinates(this.calc.polygon.getSideNailIndex(0, 0))
    );

    for (let side = 0; side < sides; side++) {
      const nextSide = (side + limitedBezier) % sides;

      renderer.setColor(this.color.getColor(side));

      for (let i = 0; i < n - 1; i++) {
        if (i || side) {
          renderer.lineTo(
            this.nails.getNailCoordinates(polygon.getSideNailIndex(side, i))
          );

          yield;
        }

        renderer.lineTo(
          this.nails.getNailCoordinates(polygon.getSideNailIndex(nextSide, i))
        );

        yield;

        if (i !== n - 2) {
          i++;
          renderer.lineTo(
            this.nails.getNailCoordinates(polygon.getSideNailIndex(nextSide, i))
          );

          yield;

          renderer.lineTo(
            this.nails.getNailCoordinates(polygon.getSideNailIndex(side, i))
          );

          yield;
        } else {
          renderer.lineTo(
            this.nails.getNailCoordinates(
              polygon.getSideNailIndex((nextSide + 1) % sides, 0)
            )
          );
        }
      }
    }

    renderer.lineTo(
      this.nails.getNailCoordinates(this.calc.polygon.getSideNailIndex(0, 0))
    );
    yield;
  }

  getStepCount() {
    const { sides, n } = this.config;
    return sides * (2 * (n - 1));
  }

  drawNails(nails: NailsSetter) {
    this.calc.polygon.drawNails(nails);
  }

  testStepCountConfig: Partial<Config<PolygonPatternConfig>>[] = [
    {
      sides: 4,
      n: 10,
    },
    {
      sides: 4,
      n: 11,
    },
    {
      sides: 3,
      n: 11,
    },
    {
      sides: 3,
      n: 10,
    },
    {
      sides: 3,
      n: 2,
    },
  ];

  thumbnailConfig = ({ n }) => ({
    n: Math.min(n, 20),
  });
}
