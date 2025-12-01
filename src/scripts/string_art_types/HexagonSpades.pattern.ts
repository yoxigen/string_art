import { createArray } from '../helpers/array_utils';
import Color from '../helpers/color/Color';
import Controller from '../infra/Controller';
import Polygon from '../shapes/Polygon';
import { ControlsConfig } from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import leavesCommonControls from './leaves/leaves_controls';
import Leaves, { LeavesCalc, LeavesConfig, Tile } from './leaves/LeavesBase';

export interface HexagonSpadesConfig extends LeavesConfig {
  mirrorTiling: boolean;
  crossWeave: boolean;
  withSides: boolean;
}

export default class HexagonSpades extends Leaves<HexagonSpadesConfig> {
  static type = 'hexagon_spades';
  id = 'hexagon_spades';
  name = 'Hexagon Spades';
  controls: ControlsConfig<HexagonSpadesConfig> = [
    ...leavesCommonControls,
    {
      key: 'mirrorTiling',
      label: 'Mirror tiling',
      defaultValue: true,
      type: 'checkbox',
      isStructural: true,
      affectsStepCount: false,
    },
    {
      key: 'crossWeave',
      label: 'Cross weave',
      defaultValue: false,
      type: 'checkbox',
      isStructural: false,
    },
    {
      key: 'withSides',
      label: 'With sides',
      defaultValue: true,
      type: 'checkbox',
      isStructural: false,
    },
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        colorCount: 3,
        color: '#ffffff',
        multicolorRange: 88,
        multicolorStart: 180,
        multicolorByLightness: true,
        minLightness: 60,
        maxLightness: 64,
        reverseColors: true,
      },
      maxColorCount: 10,
    }),
  ];

  getCalc({ size }: CalcOptions): LeavesCalc {
    const { margin, rotation, maxDensity, angle, mirrorTiling } = this.config;

    const patternPolygon = new Polygon({
      sides: 6,
      size,
      fitSize: true,
      margin,
      nailsPerSide: 2,
      rotation,
    });

    const interiorAngle = ((3 - 2) * Math.PI) / 3;

    const centerHelperPolygon = new Polygon({
      sides: 6,
      radius: patternPolygon.radius / (2 * Math.cos(interiorAngle / 2)),
      nailsPerSide: 2,
      rotation: rotation + 1 / (2 * 6),
      center: patternPolygon.center,
    });

    const { depth } = this.getInnerRotationParams({
      sides: 3,
      baseSideSize: patternPolygon.sideSize,
    });
    const nailsPerPolygon = depth * 3;
    const tiles: Tile[] = createArray(6, i => {
      const nailIndexStart = nailsPerPolygon * i;
      return {
        polygon: new Polygon({
          radius: centerHelperPolygon.sideSize,
          sides: 3,
          nailsPerSide: 2,
          center: centerHelperPolygon.getSidePoint({ side: i, index: 0 }),
          rotation: rotation + (1 / centerHelperPolygon.config.sides) * (i + 1),
          getUniqueKey: i ? k => k + nailsPerPolygon * i : undefined,
        }),
        depth,
        direction: mirrorTiling ? (i % 2 ? -1 : 1) : 1,
        nailIndexStart,
      };
    });

    return { tiles };
  }

  #getColor(tile: number, side: number): string {
    return this.color.getColor(
      tile % 2 ? (side === 1 ? 2 : side === 2 ? 1 : side) : side
    );
  }

  *#drawAll(controller: Controller): Generator<void> {
    const { withSides } = this.config;
    const { tiles } = this.calc;

    for (let tileIndex = 0; tileIndex < tiles.length; tileIndex++) {
      const sideIndex = 1;

      controller.startLayer({
        name: sideIndex.toString(),
        color: this.#getColor(tileIndex, sideIndex),
      });
      const nextTile = tiles[(tileIndex + 1) % tiles.length];
      const nextSide = (sideIndex + 1) % 3;
      const nextUpperSide = nextSide;
      const nextTileSide = sideIndex - 1;

      const tile = tiles[tileIndex];

      controller.goto(this.getNailIndex(tile, nextSide, 0));
      yield controller.stringTo(this.getNailIndex(tile, sideIndex, 0));
      for (let i = 1; i < tile.depth; i++) {
        yield controller.stringTo(this.getNailIndex(tile, sideIndex, i));
        yield controller.stringTo(this.getNailIndex(tile, nextSide, i));
        yield controller.stringTo(
          this.getNailIndex(nextTile, nextUpperSide, i)
        );
        yield controller.stringTo(this.getNailIndex(nextTile, nextTileSide, i));
        yield controller.stringTo(this.getNailIndex(tile, sideIndex, i));
        // stringTo tile.side(i) to tile.nextSide(i), then to nextTile.nextSide(i) then tile.side(i).
      }

      if (withSides) {
        controller.startLayer({
          name: 'Sides',
          color: this.color.getColor(0),
        });
        yield* this.connectSides(controller, tileIndex, 1, 0);
      } else {
        // Close the outward-pointing leaves, since there are no sides to close them
        for (let i = tile.depth - 1; i >= 0; i--) {
          yield controller.stringTo(
            this.getNailIndex(nextTile, nextTileSide, i)
          );
        }
      }
    }
  }

  *drawStrings(controller: Controller): Generator<void> {
    if (this.config.crossWeave) {
      yield* this.#drawAll(controller);
    } else if (
      (this.config.isMultiColor && this.config.colorCount > 1) ||
      !this.config.withSides
    ) {
      yield* this.drawTiles(
        controller,
        this.config.withSides ? null : new Set([0])
      );
    } else {
      yield* this.drawSpiralsOnly(controller);
    }
  }

  getStepCount(options: CalcOptions): number {
    const { crossWeave, withSides } = this.config;
    const { tiles } = this.calc ?? this.getCalc(options);

    const nailsPerSide = tiles[0].depth;
    const nailsPerTile = nailsPerSide * 3;

    if (crossWeave) {
      return (
        tiles.length *
        ((nailsPerSide - 1) * 5 +
          (withSides ? nailsPerSide * 2 - 1 : nailsPerSide) +
          1)
      );
    } else if (
      (this.config.isMultiColor && this.config.colorCount > 1) ||
      !this.config.withSides
    ) {
      return tiles.length * (3 - (withSides ? 0 : 1)) * (nailsPerSide * 2 - 1);
    } else {
      return tiles.length * Math.floor((nailsPerTile - 1) * (1 + 1 / 3));
    }
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
}
