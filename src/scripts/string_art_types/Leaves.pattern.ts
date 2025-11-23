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
  polygons: Polygon[];
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
        max: 100,
        step: 1,
      },
      defaultValue: 30,
      isStructural: true,
    },
    {
      key: 'angle',
      type: 'range',
      label: 'Sides rotation',
      attr: {
        min: 0.001,
        max: 0.2,
        step: 0.001,
      },
      displayValue: ({ angle }) => `${roundNumber((angle ?? 0) * 360, 2)}°`,
      defaultValue: 0.025,
      affectsStepCount: false,
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

    const polygons = [
      new Polygon({
        sides,
        size,
        nailsPerSide: 2,
        fitSize: true,
        margin,
      }),
    ];

    return {
      polygons,
      angleRadians: (angle * PI2) / sides,
      center: getCenter(size),
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
      for (let side = 0; side < sides; side++) {
        if (i || side) {
          yield controller.stringTo(n * side + i);
        }
      }

      yield controller.stringTo(i);
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
    const { polygons, angleRadians } = this.calc;
    const { n, sides } = this.config;
    const nailsPerPolygon = n * sides;
    const theta = Math.PI * (1 - 2 / sides);

    const distanceProportion =
      Math.tan(angleRadians) /
      (Math.sin(theta) + Math.tan(angleRadians) * (1 + Math.cos(theta)));

    function drawPolygonNails(polygon: Polygon, polygonIndex: number = 0) {
      const startIndex = nailsPerPolygon * polygonIndex;

      for (let side = 0; side < sides; side++) {
        const sideStartIndex = startIndex + n * side;
        let base = polygon.sideSize;
        let prevPoint = polygon.getSidePoint({ side, index: 0 });
        nails.addNail(sideStartIndex, prevPoint);
        const sideAngle =
          (side * PI2) / sides + (sides % 2 ? Math.PI / sides : Math.PI * 0.75);

        for (let i = 1; i < n; i++) {
          const distance = base * distanceProportion;
          const point = [
            prevPoint[0] + distance * Math.cos(sideAngle + angleRadians * i),
            prevPoint[1] + distance * Math.sin(sideAngle + angleRadians * i),
          ] as Coordinates;

          nails.addNail(sideStartIndex + i, point);
          prevPoint = point;
          base -= distance;
        }
      }
    }

    drawPolygonNails(polygons[0]);
  }

  thumbnailConfig = (config: LeavesConfig) => ({
    n: Math.min(10, config.n),
  });
}
