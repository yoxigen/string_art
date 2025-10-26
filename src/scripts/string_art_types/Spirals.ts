import StringArt from '../StringArt';
import Circle from '../shapes/Circle';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorMap } from '../helpers/color/color.types';
import { PI2 } from '../helpers/math_utils';
import Renderer from '../renderers/Renderer';
import { ControlsConfig } from '../types/config.types';
import { Coordinates } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';
import Nails from '../Nails';
import { getCenter } from '../helpers/size_utils';
import { createArray } from '../helpers/array_utils';
import { formatFractionAsAngle } from '../helpers/string_utils';
import easing from '../helpers/easing';

interface SpiralsConfig extends ColorConfig {
  // radiusIncrease: number;
  angleStep: number;
  angle: number;
  nSpirals: number;
  rotation: number;
  nailsPerSpiral: number;
  radiusEasing: number;
  angleEasing: number;
}

interface TCalc {
  spiralRotations: number[];
  rotationAngle: number;
  center: Coordinates;
  angle: number;
  radius: number;
}

class Spirals extends StringArt<SpiralsConfig, TCalc> {
  static type = 'spirals';

  name = 'Spirals';
  id = 'spirals';
  link =
    'https://www.etsy.com/il-en/listing/974865185/3d-string-art-spiral-mandala-wall?ref=shop_home_active_10&frs=1';
  controls: ControlsConfig<SpiralsConfig> = [
    {
      key: 'nSpirals',
      label: 'Number of spirals',
      defaultValue: 3,
      type: 'range',
      attr: { min: 2, max: 20, step: 1 },
      isStructural: true,
    },
    {
      key: 'nailsPerSpiral',
      label: 'Nails per spiral',
      type: 'range',
      defaultValue: 80,
      attr: {
        min: 3,
        max: 300,
        step: 1,
      },
      isStructural: true,
    },
    {
      key: 'angle',
      label: 'Angle',
      type: 'range',
      defaultValue: 0.52,
      attr: {
        min: 0,
        max: 2,
        step: 0.026,
      },
      displayValue: ({ angle }) => formatFractionAsAngle(angle),
      isStructural: true,
      affectsStepCount: false,
    },
    {
      key: 'radiusEasing',
      label: 'Radius easing',
      defaultValue: 1.8,
      type: 'range',
      attr: { min: 1, max: 10, step: 0.1 },
      isStructural: true,
      affectsStepCount: false,
    },
    {
      key: 'angleEasing',
      label: 'Angle easing',
      defaultValue: 1.3,
      type: 'range',
      attr: { min: 1, max: 10, step: 0.1 },
      isStructural: true,
      affectsStepCount: false,
    },
    {
      ...Circle.rotationConfig,
      defaultValue: 65 / 360,
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

  getCalc({ size }: CalcOptions): TCalc {
    const { nSpirals, rotation, margin, angle } = this.config;
    const maxRadius = Math.min(...size) / 2 - margin;

    return {
      spiralRotations: createArray(nSpirals, i => (i * PI2) / nSpirals),
      rotationAngle: -PI2 * rotation,
      angle: angle * PI2,
      center: getCenter(size),
      radius: maxRadius,
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);

    const { colorCount } = this.config;

    this.color = new Color(this.config);
    this.colorMap = this.color.getColorMap({
      stepCount: this.getStepCount(),
      colorCount,
    });
  }

  /**
   * TODO: The aspect ratio isn't really 1, but it's hard to calculate. Will tackle it in the future
   */
  getAspectRatio(): number {
    return 1;
  }

  *generatePoints(
    withNailNumbers = true
  ): Generator<{ point: Coordinates; nailNumber: string }> {
    const { nSpirals, nailsPerSpiral } = this.config;
    for (let i = 1; i < nailsPerSpiral; i++) {
      for (let s = 0; s < nSpirals; s++) {
        const point = this.getPoint(s, i);
        yield {
          point,
          nailNumber: withNailNumbers ? `${s + 1}_${i + 1}` : null,
        };
      }
    }
  }

  getPoint(spiralIndex: number, index: number): Coordinates {
    const { center, radius: maxRadius, angle: totalAngle } = this.calc;
    const { nailsPerSpiral, radiusEasing, angleEasing } = this.config;
    const position = index / (nailsPerSpiral - 1);

    const angle =
      this.calc.rotationAngle +
      easing.easeOutFixed(angleEasing, 0, position) * totalAngle +
      this.calc.spiralRotations[spiralIndex];
    const radius = easing.easeOutFixed(radiusEasing, 0, position) * maxRadius;

    return [
      center[0] + radius * Math.sin(angle),
      center[1] + radius * Math.cos(angle),
    ];
  }

  *drawStrings(renderer: Renderer): Generator<void> {
    const points = this.generatePoints();
    let index = 0;
    renderer.setColor(this.color.getColor(0));
    renderer.setStartingPoint(this.calc.center);

    for (const { point } of points) {
      if (this.colorMap) {
        const stepColor = this.colorMap.get(index);
        if (stepColor) {
          renderer.setColor(stepColor);
        }
      }

      renderer.lineTo(point);
      yield;

      index++;
    }
  }

  getStepCount(): number {
    const { nSpirals, nailsPerSpiral } = this.config;
    return (nailsPerSpiral - 1) * nSpirals;
  }

  drawNails(nails: Nails) {
    nails.addNail({ point: this.calc.center, number: '1' });
    const points = this.generatePoints();
    for (const { point, nailNumber } of points) {
      nails.addNail({ point, number: nailNumber });
    }
  }

  getNailCount(): number {
    const { nSpirals, nailsPerSpiral } = this.config;
    return nSpirals * (nailsPerSpiral - 1) + 1;
  }

  thumbnailConfig = ({ nailsPerSpiral }) => ({
    nailsPerSpiral: Math.min(30, nailsPerSpiral),
  });
}

export default Spirals;
