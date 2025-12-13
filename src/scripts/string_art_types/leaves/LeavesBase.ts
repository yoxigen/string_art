import StringArt from '../../infra/StringArt';
import Color from '../../helpers/color/Color';
import { Config } from '../../types/config.types';
import { CalcOptions } from '../../types/stringart.types';
import NailsSetter from '../../infra/nails/NailsSetter';
import Controller from '../../infra/Controller';
import Polygon from '../../shapes/Polygon';
import { PI2 } from '../../helpers/math_utils';
import { connectTwoSides } from '../../helpers/draw_utils';
import { ColorConfig } from '../../helpers/color/color.types';
import { createArray } from '../../helpers/array_utils';

export interface LeavesConfig extends ColorConfig {
  angle: number;
  rotation: number;
  maxDensity: number;
}

export type Tile = {
  polygon: Polygon;
  depth: number;
  direction?: 1 | -1;
  nailIndexStart?: number;
};

export type LeavesCalc = {
  tiles: Tile[];
};

export default abstract class Leaves<
  TConfig extends LeavesConfig
> extends StringArt<TConfig, LeavesCalc> {
  color: Color;

  abstract getCalc({ size }: CalcOptions): LeavesCalc;

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    this.color = new Color(this.config);
  }

  protected getInnerRotationParams({
    sides,
    baseSideSize,
  }: {
    sides: number;
    baseSideSize: number;
  }): {
    layerAngle: number;
    sizeRatio: number;
    depth: number;
  } {
    const { angle, maxDensity } = this.config;
    const key = [sides, maxDensity, baseSideSize, angle].join('_');
    const cached = this.getInnerRotationParams[key];
    if (cached) {
      return cached;
    }

    const piSides = Math.PI / sides;
    const interiorAngle = ((sides - 2) * Math.PI) / sides;

    const layerAngleChange = Math.atan(
      (1 - 2 * angle) / Math.tan(interiorAngle / 2)
    );
    const layerAngle = piSides - layerAngleChange;
    const sizeRatio = Math.cos(piSides) / Math.cos(-layerAngleChange);
    const depth = Math.max(
      1,
      Math.ceil(
        Math.log(maxDensity / (baseSideSize * angle)) / Math.log(sizeRatio)
      )
    );

    const params = { layerAngle, sizeRatio, depth };
    this.getInnerRotationParams[key] = params;
    return params;
  }

  protected getNailIndex(tile: Tile, side: number, index: number): number {
    return (
      (tile.nailIndexStart ?? 0) + side + index * tile.polygon.config.sides
    );
  }

  protected *drawSpiralsOnly(controller: Controller): Generator<void> {
    const { tiles } = this.calc;

    controller.startLayer({ color: this.color.getColor(0), name: '1' });
    controller.goto(0);

    for (let tile = 0; tile < tiles.length; tile++) {
      yield* this.drawMonochromeTile(controller, tiles[tile]);
    }
  }

  protected *connectSides(
    controller: Controller,
    tileIndex: number,
    fromSide: number,
    toSide: number
  ): Generator<void> {
    let isFirst = true;
    const tile = this.calc.tiles[tileIndex];

    for (const { side, index } of connectTwoSides(tile.depth, [
      fromSide,
      toSide,
    ])) {
      if (isFirst) {
        controller.goto(this.getNailIndex(tile, side, index));
        isFirst = false;
      } else {
        yield controller.stringTo(this.getNailIndex(tile, side, index));
      }
    }
  }

  protected getColor(tile: number, side: number): string {
    return this.color.getColor(
      tile % 2 ? (side === 1 ? 2 : side === 2 ? 1 : side) : side
    );
  }

  protected *drawTile(
    controller: Controller,
    tileIndex: number,
    excludedSides?: Set<number>
  ): Generator<void> {
    const tile = this.calc.tiles[tileIndex];

    for (let side = 0; side < tile.polygon.config.sides; side++) {
      if (excludedSides?.has(side)) {
        continue;
      }

      controller.startLayer({
        name: side.toString(),
        color: this.getColor(tileIndex, side),
      });
      yield* this.connectSides(
        controller,
        tileIndex,
        side,
        (side + 1) % tile.polygon.config.sides
      );
    }
  }

  protected *drawMonochromeTile(
    controller: Controller,
    tile: Tile
  ): Generator<void> {
    const startIndex = tile.nailIndexStart ?? 0;
    controller.goto(startIndex);

    const nailsPerTile = tile.polygon.config.sides * tile.depth;

    for (let i = 1; i < nailsPerTile; i++) {
      if (!(i % tile.polygon.config.sides)) {
        yield controller.stringTo(startIndex + i - tile.polygon.config.sides);
      }

      yield controller.stringTo(startIndex + i);
    }
  }

  protected *drawTiles(
    controller: Controller,
    excludedSides?: Set<number>
  ): Generator<void> {
    for (let tile = 0; tile < this.calc.tiles.length; tile++) {
      yield* this.drawTile(controller, tile, excludedSides);
    }
  }

  protected *drawLeavesTile(
    controller: Controller,
    tile: Tile
  ): Generator<void> {
    const startIndex = tile.polygon.getSideNailIndex(0);
    controller.goto(startIndex);

    const nailsPerTile = tile.polygon.config.sides * tile.depth;

    for (let i = 1; i < nailsPerTile; i++) {
      if (!(i % tile.polygon.config.sides)) {
        yield controller.stringTo(startIndex + i - tile.polygon.config.sides);
      }

      yield controller.stringTo(startIndex + i);
    }
  }

  protected *connectTileSides(
    controller: Controller,
    tile: Tile,
    fromSide: number,
    toSide: number
  ): Generator<void> {
    let isFirst = true;

    for (const { side, index } of connectTwoSides(tile.depth, [
      fromSide,
      toSide,
    ])) {
      if (isFirst) {
        controller.goto(this.getNailIndex(tile, side, index));
        isFirst = false;
      } else {
        yield controller.stringTo(this.getNailIndex(tile, side, index));
      }
    }
  }

  *drawStrings(controller: Controller): Generator<void> {
    if (this.config.isMultiColor && this.config.colorCount > 1) {
      yield* this.drawTiles(controller);
    } else {
      yield* this.drawSpiralsOnly(controller);
    }
  }

  getStepCount(options: CalcOptions): number {
    const { tiles } = this.calc ?? this.getCalc(options);

    return tiles.reduce(
      (stepCount, tile) =>
        stepCount +
        (this.config.isMultiColor && this.config.colorCount > 1
          ? tile.polygon.config.sides * (tile.depth * 2 - 1)
          : tile.depth * (tile.polygon.config.sides + 1) - 2),
      0
    );
  }

  protected getPolygonsForTile(tile: Tile): Polygon[] {
    const sides = tile.polygon.config.sides;

    const {
      layerAngle,
      sizeRatio,
      depth: nailsPerSide,
    } = this.getInnerRotationParams({
      sides,
      baseSideSize: tile.polygon.sideSize,
    });

    const polygons = [tile.polygon].concat(
      createArray(nailsPerSide - 1, i => {
        const layer = i + 1;

        const polygon = new Polygon({
          sides,
          nailsPerSide: 2,
          rotation:
            (tile.polygon.config.rotation ?? 0) +
            ((tile.direction ?? 1) * layerAngle * layer) / PI2,
          center: tile.polygon.center,
          radius: tile.polygon.radius * Math.pow(sizeRatio, layer),
          getUniqueKey: k => (tile.nailIndexStart ?? 0) + sides * layer + k,
        });

        return polygon;
      })
    );

    return polygons;
  }

  drawNails(nails: NailsSetter) {
    const { tiles } = this.calc;
    tiles.forEach(tile => {
      const polygons = this.getPolygonsForTile(tile);
      polygons.forEach(polygon => polygon.drawNails(nails));
    });
  }

  thumbnailConfig: Partial<Config<TConfig>> = {
    maxDensity: 1,
  } as unknown as Partial<Config<TConfig>>;
}
