import { createArray } from '../helpers/array_utils';
import Color from '../helpers/color/Color';
import Polygon from '../shapes/Polygon';
import { Config, ControlsConfig } from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import leavesCommonControls from './leaves/leaves_controls';
import Leaves, { LeavesCalc, LeavesConfig, Tile } from './leaves/LeavesBase';

export interface StarOfDavidConfig extends LeavesConfig {
  mirrorTiling: boolean;
}

export default class StarOfDavid extends Leaves<StarOfDavidConfig> {
  static type = 'star_of_david';
  id = 'star_of_david';
  name = 'Star of David';
  controls: ControlsConfig<StarOfDavidConfig> = [
    ...leavesCommonControls,
    {
      key: 'mirrorTiling',
      label: 'Mirror tiling',
      defaultValue: false,
      type: 'checkbox',
      isStructural: true,
      affectsStepCount: false,
    },
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        colorCount: 6,
        color: '#ffffff',
        multicolorStart: 45,
        multicolorRange: 1,
        multicolorByLightness: true,
        minLightness: 60,
        maxLightness: 100,
        reverseColors: false,
      },
      maxColorCount: 6,
    }),
  ];

  defaultValues: Partial<Config<StarOfDavidConfig>> = {
    maxDensity: 2.66,
    angle: 0.063,
  };

  getCalc({ size }: CalcOptions): LeavesCalc {
    const { margin, rotation, mirrorTiling } = this.config;

    const outerHexagon = new Polygon({
      sides: 6,
      size,
      fitSize: true,
      margin,
      nailsPerSide: 2,
      rotation: 1 / 12 + rotation,
    });

    const hexagon = new Polygon({
      sides: 6,
      radius: outerHexagon.radius / (2 * Math.cos(Math.PI / 6)),
      center: outerHexagon.center,
      nailsPerSide: 2,
      rotation,
    });

    const triangleRadius = hexagon.sideSize / (2 * Math.cos(Math.PI / 6));

    const trianglesCenterHexagon = new Polygon({
      sides: 6,
      radius: hexagon.getApothem() + triangleRadius / 2,
      center: outerHexagon.center,
      nailsPerSide: 2,
      rotation: 1 / 12 + rotation,
    });

    const { depth: hexagonDepth } = this.getInnerRotationParams({
      sides: 6,
      baseSideSize: hexagon.sideSize,
    });

    const { depth: triangleDepth } = this.getInnerRotationParams({
      sides: 3,
      baseSideSize: hexagon.sideSize,
    });

    const trianglesStartIndex = hexagonDepth * 6;
    const nailsPerTriangle = triangleDepth * 3;

    const triangles = createArray(
      6,
      i =>
        new Polygon({
          sides: 3,
          center: trianglesCenterHexagon.getSidePoint({ side: i, index: 0 }),
          radius: triangleRadius,
          nailsPerSide: 2,
          rotation: rotation + (i * 1) / 6,
          getUniqueKey: k => trianglesStartIndex + nailsPerTriangle * i + k,
        })
    );

    const tiles: Tile[] = [
      {
        polygon: hexagon,
        depth: hexagonDepth,
      },
      ...triangles.map(
        (polygon, i) =>
          ({
            polygon,
            depth: triangleDepth,
            direction: mirrorTiling ? 1 : -1,
            nailIndexStart: trianglesStartIndex + nailsPerTriangle * i,
          } as Tile)
      ),
    ];

    return { tiles };
  }

  protected getColor(tile: number, side: number): string {
    if (tile) {
      return side === 2
        ? this.color.getColor(tile - 1)
        : this.color.getColor(
            this.config.colorCount === 2 ? tile : tile + side
          );
    }
    return this.color.getColor(
      tile % 2 ? (side === 1 ? 2 : side === 2 ? 1 : side) : side
    );
  }

  getAspectRatio({ size }: CalcOptions): number {
    const { margin, rotation } = this.config;

    const patternPolygon = new Polygon({
      sides: 6,
      size,
      fitSize: true,
      margin,
      nailsPerSide: 2,
      rotation,
    });

    return patternPolygon.getAspectRatio();
  }

  testStepCountConfig = [
    {
      isMultiColor: false,
      colorCount: 1,
    },
  ];
}
