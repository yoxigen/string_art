import StringArt from '../infra/StringArt';
import Color from '../helpers/color/Color';
import { ColorConfig } from '../helpers/color/color.types';
import { Config, ControlsConfig } from '../types/config.types';
import { CalcOptions } from '../types/stringart.types';
import { formatFractionAsAngle } from '../helpers/string_utils';
import NailsSetter from '../infra/nails/NailsSetter';
import Controller from '../infra/Controller';
import Polygon from '../shapes/Polygon';
import {
  getDistanceBetweenCoordinates,
  PI2,
  roundNumber,
} from '../helpers/math_utils';
import { Coordinates } from '../types/general.types';
import { getCenter, mapDimensions } from '../helpers/size_utils';
import { createArray } from '../helpers/array_utils';
import { connectTwoSides } from '../helpers/draw_utils';

interface LeavesConfig extends ColorConfig {
  angle: number;
  sides: number;
  rotation: number;
  maxDensity: number;
  mirrorTiling: boolean;
  crossWeave: boolean;
  withSides: boolean;
}

type TCalc = {
  angleRadians: number;
  polygons: Polygon[];
  nailsPerSide: number;
  nailsPerTile: number;
  tiles: number;
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
      defaultValue: 0.088,
      displayValue: ({ angle, sides }) =>
        `${roundNumber((180 * angle) / sides, 2)}°`,
      type: 'range',
      attr: { min: 0.01, max: 0.15, step: 0.001 },
      isStructural: true,
    },
    {
      key: 'maxDensity',
      label: 'Max density',
      defaultValue: 5,
      type: 'range',
      attr: { min: 1, max: 20, step: 0.01 },
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
    {
      ...Polygon.rotationConfig,
      displayValue: ({ rotation }) => formatFractionAsAngle(rotation),
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

  color: Color;

  getCalc({ size }: CalcOptions): TCalc {
    const { sides, angle, margin, rotation, mirrorTiling, maxDensity } =
      this.config;
    const center = getCenter(size);

    const piSides = Math.PI / sides;
    const tiles = Math.floor(360 / (180 - 360 / sides));

    const patternPolygon = new Polygon({
      sides: tiles,
      size,
      fitSize: true,
      margin,
      nailsPerSide: 2,
      rotation,
    });

    const interiorAngle = ((sides - 2) * Math.PI) / sides;

    const centerHelperPolygon = new Polygon({
      sides: tiles,
      radius: patternPolygon.radius / (2 * Math.cos(interiorAngle / 2)),
      nailsPerSide: 2,
      rotation: rotation + 1 / (2 * tiles),
      size: [1, 1],
      center: patternPolygon.center,
    });

    let totalNailsCount = 0;
    let nailsPerSide = 0;

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

        if (
          getDistanceBetweenCoordinates(
            previousPolygon.getSidePoint({ side: 0, index: 0 }),
            polygon.getSidePoint({ side: 0, index: 0 })
          ) < maxDensity
        ) {
          break;
        }

        polygons.push(polygon);
        previousPolygon = polygon;
        totalNailsCount += polygon.getNailsCount();
      }

      return polygons;
    }

    const polygons = createArray(tiles, i => {
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

      const polygons = getPolygonsForBase(
        basePolygon,
        mirrorTiling ? (i % 2 ? -1 : 1) : 1
      );

      if (i === 0) {
        nailsPerSide = polygons.length;
      }

      return polygons;
    }).flat();

    return {
      polygons,
      angleRadians: (angle * PI2) / sides,
      nailsPerSide,
      tiles: tiles,
      nailsPerTile: nailsPerSide * sides,
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);

    this.color = new Color(this.config);
  }

  getAspectRatio(): number {
    return 1;
  }

  #getNailIndex(tile: number, side: number, index: number): number {
    return this.calc.nailsPerTile * tile + side + index * this.config.sides;
  }

  *#drawSpiralsOnly(controller: Controller): Generator<void> {
    const { sides } = this.config;
    const { tiles, nailsPerTile } = this.calc;

    controller.startLayer({ color: this.color.getColor(0), name: '1' });
    controller.goto(0);

    for (let tile = 0; tile < tiles; tile++) {
      const tileStart = nailsPerTile * tile;

      controller.goto(tileStart);
      for (let i = 1; i < nailsPerTile; i++) {
        if (!(i % sides)) {
          yield controller.stringTo(tileStart + i - sides);
        }

        yield controller.stringTo(tileStart + i);
      }
    }
  }

  *#connectSides(
    controller: Controller,
    tile: number,
    fromSide: number,
    toSide: number
  ): Generator<void> {
    let isFirst = true;

    for (const { side, index } of connectTwoSides(this.calc.nailsPerSide, [
      fromSide,
      toSide,
    ])) {
      if (isFirst) {
        controller.goto(this.#getNailIndex(tile, side, index));
        isFirst = false;
      } else {
        yield controller.stringTo(this.#getNailIndex(tile, side, index));
      }
    }
  }

  #getColor(tile: number, side: number): string {
    return this.color.getColor(
      tile % 2 ? (side === 1 ? 2 : side === 2 ? 1 : side) : side
    );
  }

  *#drawTile(controller: Controller, tile: number): Generator<void> {
    const { sides, withSides } = this.config;

    for (let side = 0; side < sides; side++) {
      if (!withSides && side === 0) {
        continue;
      }

      controller.startLayer({
        name: side.toString(),
        color: this.#getColor(tile, side),
      });
      yield* this.#connectSides(controller, tile, side, (side + 1) % sides);
    }
  }

  *#drawTiles(controller: Controller): Generator<void> {
    for (let tile = 0; tile < this.calc.tiles; tile++) {
      yield* this.#drawTile(controller, tile);
    }
  }

  *#drawAll(controller: Controller): Generator<void> {
    const { sides, withSides } = this.config;
    const { tiles, nailsPerSide } = this.calc;

    for (let tile = 0; tile < tiles; tile++) {
      const sideIndex = 1;

      controller.startLayer({
        name: sideIndex.toString(),
        color: this.#getColor(tile, sideIndex),
      });
      const nextTile = (tile + 1) % tiles;
      const nextSide = (sideIndex + 1) % sides;
      const nextUpperSide = nextSide;
      const nextTileSide = sideIndex - 1;

      controller.goto(this.#getNailIndex(tile, nextSide, 0));
      yield controller.stringTo(this.#getNailIndex(tile, sideIndex, 0));
      for (let i = 1; i < nailsPerSide; i++) {
        yield controller.stringTo(this.#getNailIndex(tile, sideIndex, i));
        yield controller.stringTo(this.#getNailIndex(tile, nextSide, i));
        yield controller.stringTo(
          this.#getNailIndex(nextTile, nextUpperSide, i)
        );
        yield controller.stringTo(
          this.#getNailIndex(nextTile, nextTileSide, i)
        );
        yield controller.stringTo(this.#getNailIndex(tile, sideIndex, i));
        // stringTo tile.side(i) to tile.nextSide(i), then to nextTile.nextSide(i) then tile.side(i).
      }

      if (withSides) {
        controller.startLayer({
          name: 'Sides',
          color: this.color.getColor(0),
        });
        yield* this.#connectSides(controller, tile, 1, 0);
      } else {
        // Close the outward-pointing leaves, since there are no sides to close them
        for (let i = nailsPerSide - 1; i >= 0; i--) {
          yield controller.stringTo(
            this.#getNailIndex(nextTile, nextTileSide, i)
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
      yield* this.#drawTiles(controller);
    } else {
      yield* this.#drawSpiralsOnly(controller);
    }
  }

  getStepCount(options: CalcOptions): number {
    const { nailsPerSide, tiles, nailsPerTile } =
      this.calc ?? this.getCalc(options);

    const { sides, crossWeave, withSides } = this.config;

    if (crossWeave) {
      return (
        tiles *
        ((nailsPerSide - 1) * 5 +
          (withSides ? nailsPerSide * 2 - 1 : nailsPerSide) +
          1)
      );
    } else if (
      (this.config.isMultiColor && this.config.colorCount > 1) ||
      !this.config.withSides
    ) {
      return tiles * (sides - (withSides ? 0 : 1)) * (nailsPerSide * 2 - 1);
    } else {
      return tiles * Math.floor((nailsPerTile - 1) * (1 + 1 / sides));
    }
  }

  getNailCount(): number {
    const { sides } = this.config;
    return sides;
  }

  drawNails(nails: NailsSetter) {
    const { polygons } = this.calc;
    polygons.forEach(polygon => polygon.drawNails(nails));
  }

  thumbnailConfig: Partial<Config<LeavesConfig>> = {
    maxDensity: 1,
  };
}
