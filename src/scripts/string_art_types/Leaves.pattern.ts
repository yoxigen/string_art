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
import { getCenter, mapDimensions } from '../helpers/size_utils';
import { createArray } from '../helpers/array_utils';

interface LeavesConfig extends ColorConfig {
  angle: number;
  sides: number;
  rotation: number;
  mirrorTiling: boolean;
}

type TCalc = {
  angleRadians: number;
  polygons: Polygon[];
  center: Coordinates;
  nailsPerSide: number;
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
      key: 'angle',
      label: 'Layer angle',
      defaultValue: 0.01,
      displayValue: ({ angle, sides }) =>
        `${roundNumber((180 * angle) / sides, 2)}°`,
      type: 'range',
      attr: { min: 0.01, max: 0.15, step: 0.001 },
      isStructural: true,
    },
    {
      key: 'mirrorTiling',
      label: 'Mirror tiling',
      defaultValue: true,
      type: 'checkbox',
      isStructural: true,
      affectsStepCount: false,
    },
    Polygon.rotationConfig,
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
    const { sides, angle, margin, rotation, mirrorTiling } = this.config;
    const center = getCenter(size);

    const piSides = Math.PI / sides;
    const helperPolygonSides = 360 / (180 - 360 / sides);

    const patternPolygon = new Polygon({
      sides: helperPolygonSides,
      size,
      fitSize: true,
      margin,
      nailsPerSide: 2,
      rotation,
    });

    const centerHelperPolygon = new Polygon({
      sides: helperPolygonSides,
      radius: patternPolygon.radius / 2,
      nailsPerSide: 2,
      rotation: rotation + 1 / (2 * helperPolygonSides),
      size: [1, 1],
      center: patternPolygon.center,
    });

    let totalNailsCount = 0;

    function getPolygonsForBase(
      basePolygon: Polygon,
      direction: number
    ): Polygon[] {
      totalNailsCount += basePolygon.getNailsCount();

      let previousPolygon = basePolygon;
      const polygons = [basePolygon];

      for (let layer = 0; layer < 500; layer++) {
        const layerIndexStart = totalNailsCount;

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
          rotation:
            (previousPolygon.config.rotation ?? 0) +
            (direction * layerAngle) / PI2,
          center: basePolygon.center,
          radius,
          getUniqueKey: layerIndexStart ? k => layerIndexStart + k : undefined,
        });

        if (previousPolygon.sideSize - polygon.sideSize < 8) {
          break;
        }

        polygons.push(polygon);
        previousPolygon = polygon;
        totalNailsCount += polygon.getNailsCount();
      }

      return polygons;
    }

    const polygons = createArray(patternPolygon.config.sides, i => {
      const layerIndexStart = totalNailsCount;

      const basePolygon = new Polygon({
        size: center,
        radius: centerHelperPolygon.sideSize,
        sides,
        nailsPerSide: 2,
        center: centerHelperPolygon.getSidePoint({ side: i, index: 0 }),
        rotation: rotation + (1 / centerHelperPolygon.config.sides) * (i + 1),
        getUniqueKey: k => k + layerIndexStart,
      });

      return getPolygonsForBase(
        basePolygon,
        mirrorTiling ? (i % 2 ? -1 : 1) : 1
      );
    }).flat();

    return {
      polygons,
      angleRadians: (angle * PI2) / sides,
      center,
      nailsPerSide: polygons.length,
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

    const { sides } = this.config;
    const totalNailsCount = this.calc.nailsPerSide * sides;

    for (let i = 0; i < totalNailsCount; i++) {
      if (i) {
        if (!(i % sides)) {
          yield controller.stringTo(i - sides);
        }

        yield controller.stringTo(i);
      }
    }
  }

  getStepCount(options: CalcOptions): number {
    const { nailsPerSide } = this.calc ?? this.getCalc(options);
    const { sides } = this.config;
    return 6 * (nailsPerSide * (sides + 1) - 1);
  }

  getNailCount(): number {
    const { n, sides } = this.config;
    return n * sides;
  }

  drawNails(nails: NailsSetter) {
    const { polygons } = this.calc;
    polygons.forEach(polygon => polygon.drawNails(nails));
  }

  thumbnailConfig = (config: LeavesConfig) => ({
    n: Math.min(10, config.n),
  });
}
