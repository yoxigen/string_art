import StringArt from '../infra/StringArt';
import Color from '../helpers/color/Color';
import { ColorConfig } from '../helpers/color/color.types';
import { ControlsConfig } from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import { formatFractionAsAngle } from '../helpers/string_utils';
import NailsSetter from '../infra/nails/NailsSetter';
import Controller from '../infra/Controller';
import Polygon from '../shapes/Polygon';
import { PI2, roundNumber } from '../helpers/math_utils';
import { Coordinates } from '../types/general.types';
import { getCenter } from '../helpers/size_utils';

interface LeavesConfig extends ColorConfig {
  n: number;
  angle: number;
  sides: number;
}

type TCalc = {
  //   sideLength: number,
  angleRadians: number;
  basePolygon: Polygon;
  center: Coordinates;
};

export default class Leaves extends StringArt<LeavesConfig, TCalc> {
  static type = 'leaves';

  name = 'Leaves';
  id = 'leaves';
  controls: ControlsConfig<LeavesConfig> = [
    {
      type: 'range',
      key: 'sides',
      label: 'Sides',
      attr: {
        min: 3,
        max: 10,
        step: 1,
      },
      defaultValue: 3,
      isStructural: true,
    },
    {
      type: 'range',
      key: 'n',
      label: 'Density',
      attr: {
        min: 5,
        max: 500,
        step: 1,
      },
      defaultValue: 30,
      isStructural: true,
    },
    {
      key: 'angle',
      label: 'Layer angle',
      defaultValue: 0.01,
      displayValue: ({ angle, sides }) =>
        `${Math.round((180 * angle) / sides)}°`,
      type: 'range',
      attr: { min: 0.01, max: 0.15, step: 0.001 },
      isStructural: true,
    },
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        colorCount: 1,
        color: '#ffffff',
        multicolorRange: 1,
        multicolorStart: 1,
        multicolorByLightness: true,
        minLightness: 40,
        maxLightness: 100,
        reverseColors: true,
      },
      maxColorCount: 10,
    }),
  ];

  color: Color;

  getCalc({ size }: CalcOptions): TCalc {
    const { sides, angle, margin } = this.config;
    const center = getCenter(size);

    const basePolygon = new Polygon({
      size,
      sides,
      nailsPerSide: 2,
      center,
      fitSize: true,
      margin,
    });

    return {
      basePolygon,
      angleRadians: (angle * PI2) / sides,
      center,
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);

    this.color = new Color(this.config);
  }

  getAspectRatio(): number {
    return 1;
  }

  *drawStrings(controller: Controller): Generator<void> {
    controller.startLayer({ color: '#ffffff', name: '1' });
    controller.goto(0);

    const { sides, n } = this.config;

    for (let i = 0; i < n; i++) {
      if (i) {
        if (!(i % sides)) {
          yield controller.stringTo(i - sides);
        }

        yield controller.stringTo(i);
      }
    }
  }

  getStepCount(): number {
    const { n, sides } = this.config;
    return n * (sides + 1) - 1;
  }

  getNailCount(): number {
    const { n, sides } = this.config;
    return n * sides;
  }

  drawNails(nails: NailsSetter) {
    const { basePolygon, angleRadians } = this.calc;
    const { n, sides, angle } = this.config;
    const piSides = Math.PI / sides;
    let totalNailsCount = basePolygon.getNailsCount();

    function drawPolygonNails(polygon: Polygon, polygonIndex: number = 0) {
      let previousPolygon = polygon;

      polygon.drawNails(nails);

      for (let layer = 0; layer < 200; layer++) {
        const layerIndexStart = totalNailsCount;
        if (previousPolygon.sideSize <= 5) {
          break;
        }

        const layerAngle =
          piSides -
          Math.atan(
            (previousPolygon.sideSize * (0.5 - angle)) /
              previousPolygon.getApothem()
          );

        if (layerAngle <= 0) {
          break;
        }

        const radius =
          (previousPolygon.radius * Math.cos(piSides)) /
          Math.cos(layerAngle - piSides);

        const polygon = new Polygon({
          size: [100, 100],
          sides,
          nailsPerSide: 2,
          rotation: layerAngle / PI2 + (previousPolygon.config.rotation ?? 0),
          center: basePolygon.center,
          radius,
          getUniqueKey: layerIndexStart ? k => layerIndexStart + k : undefined,
        });

        if (previousPolygon.sideSize - polygon.sideSize < 5) {
          break;
        }

        polygon.drawNails(nails);
        previousPolygon = polygon;
        totalNailsCount += polygon.getNailsCount();
      }
    }

    drawPolygonNails(basePolygon);
  }

  thumbnailConfig = (config: LeavesConfig) => ({
    n: Math.min(10, config.n),
  });
}
