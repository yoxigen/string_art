import StringArt from '../StringArt';
import Circle from '../shapes/Circle';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorMap } from '../helpers/color/color.types';
import { PI2 } from '../helpers/math_utils';
import Renderer from '../renderers/Renderer';
import { ControlsConfig } from '../types/config.types';
import { Coordinates } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';

interface SpiralsConfig extends ColorConfig {
  radiusIncrease: number;
  angleStep: number;
  nSpirals: number;
  rotation: number;
}

interface TCalc {
  spiralRotations: number[];
  rotationAngle: number;
  nailsPerSpiral: number;
  angleIncrease: number;
}

class Spirals extends StringArt<SpiralsConfig, TCalc> {
  static type = 'spirals';

  name = 'Spirals';
  id = 'spirals';
  link =
    'https://www.etsy.com/il-en/listing/974865185/3d-string-art-spiral-mandala-wall?ref=shop_home_active_10&frs=1';
  controls: ControlsConfig<SpiralsConfig> = [
    {
      key: 'radiusIncrease',
      label: 'Radius change',
      defaultValue: 5.7,
      type: 'range',
      attr: { min: 1, max: 20, step: 0.1 },
      isStructural: true,
    },
    {
      key: 'angleStep',
      label: 'Angle step',
      defaultValue: 0.45,
      type: 'range',
      attr: { min: 0, max: 1, step: 0.01 },
      isStructural: true,
    },
    {
      key: 'nSpirals',
      label: 'Number of spirals',
      defaultValue: 3,
      type: 'range',
      attr: { min: 1, max: 20, step: 1 },
      isStructural: true,
    },
    {
      ...Circle.rotationConfig,
      defaultValue: 330 / 360,
    },
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        colorCount: 4,
        color: '#00d5ff',
        multicolorRange: 1,
        multicolorStart: 190,
        multicolorByLightness: true,
        minLightness: 50,
        maxLightness: 88,
        reverseColors: true,
      },
    }),
  ];

  color: Color;
  colorMap: ColorMap;

  getCalc(): TCalc {
    const { nSpirals, rotation, margin, radiusIncrease, angleStep } =
      this.config;
    const maxRadius = Math.min(...this.size) / 2 - margin;

    return {
      spiralRotations: new Array(nSpirals)
        .fill(null)
        .map((_, i) => (i * PI2) / nSpirals),
      rotationAngle: -PI2 * rotation,
      nailsPerSpiral: Math.floor(maxRadius / radiusIncrease),
      angleIncrease: angleStep / (maxRadius / 50),
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);

    const { colorCount } = this.config;

    this.color = new Color(this.config);
    this.colorMap = this.color.getColorMap({
      stepCount: this.getStepCount(options),
      colorCount,
    });
  }

  /**
   * TODO: The aspect ratio isn't really 1, but it's hard to calculate. Will tackle it in the future
   */
  getAspectRatio(): number {
    return 1;
  }

  *generatePoints() {
    const { nSpirals } = this.config;

    for (let i = 0; i < this.calc.nailsPerSpiral; i++) {
      for (let s = 0; s < nSpirals; s++) {
        const point = this.getPoint(s, i);
        yield { point, nailNumber: `${s}_${i}` };
      }
    }
  }

  getPoint(spiralIndex: number, index: number): Coordinates {
    const [centerx, centery] = this.center;
    const { radiusIncrease } = this.config;

    const angle =
      this.calc.rotationAngle +
      this.calc.angleIncrease * index +
      this.calc.spiralRotations[spiralIndex];
    const radius = index * radiusIncrease;

    return [
      centerx + radius * Math.sin(angle),
      centery + radius * Math.cos(angle),
    ];
  }

  *drawStrings(renderer: Renderer): Generator<void> {
    const points = this.generatePoints();
    let index = 0;
    renderer.setColor(this.color.getColor(0));
    let lastPoint = this.center;

    for (const { point } of points) {
      if (this.colorMap) {
        const stepColor = this.colorMap.get(index);
        if (stepColor) {
          renderer.setColor(stepColor);
        }
      }

      if (lastPoint) {
        renderer.renderLines(lastPoint, point);
      }
      lastPoint = point;
      index++;
      yield;
    }
  }

  getStepCount({ size }: CalcOptions): number {
    const { nSpirals, radiusIncrease, margin } = this.config;
    const maxRadius = Math.min(...size) / 2 - margin;
    const n = Math.floor(maxRadius / radiusIncrease);
    return n * nSpirals;
  }

  drawNails() {
    const points = this.generatePoints();
    for (const { point, nailNumber } of points) {
      this.nails.addNail({ point, number: nailNumber });
    }
  }

  thumbnailConfig = { radiusIncrease: 1.4, angleStep: 0.11 };
}

export default Spirals;
