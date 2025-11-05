import { createArray } from '../helpers/array_utils';
import Color from '../helpers/color/Color';
import { ColorConfig, ColorValue } from '../helpers/color/color.types';
import { PI2 } from '../helpers/math_utils';
import { getCenter } from '../helpers/size_utils';
import INails from '../infra/nails/INails';
import Renderer from '../infra/renderers/Renderer';
import StringArt from '../infra/StringArt';
import Polygon from '../shapes/Polygon';
import { Config, ControlsConfig } from '../types/config.types';
import { Coordinates, Dimensions } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';

type Side = 'left' | 'bottom' | 'right' | 'top';
const SIDES: [Side, Side, Side, Side] = ['left', 'bottom', 'right', 'top'];
const SIDES_ORDER: [Side, Side, Side, Side] = [
  'left',
  'bottom',
  'right',
  'top',
];

const SIDES_ROTATION = {
  left: 0,
  bottom: Math.PI / 2,
  right: Math.PI,
  top: Math.PI * 1.5,
};

interface EyeConfig extends ColorConfig {
  n: number;
  layers: number;
  angle: number;
  colorPerLayer: boolean;
}

interface Layer {
  layerAngle: number;
  layerSize: number;
  layerSideNailCount: number;
  layerSpaceCount: number;
  polygon: Polygon;
}
interface TCalc {
  maxSize: number;
  nailSpacing: number;
  layers: ReadonlyArray<Layer>;
  center: Coordinates;
  layersIndexStart: ReadonlyArray<number>;
  layersCount: number;
}

class Eye extends StringArt<EyeConfig, TCalc> {
  static type = 'eye';

  name = 'Eye';
  id = 'eye';
  link =
    'https://www.etsy.com/listing/489853161/rose-of-space-string-art-sacred-geometry?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=string+art&ref=sr_gallery_1&epik=dj0yJnU9WXNpM1BDTnNkLVBtcWdCa3AxN1J5QUZRY1FlbkJ5Z18mcD0wJm49ZXdJb2JXZmVpNVVwN1NKQ3lXMy10ZyZ0PUFBQUFBR0ZuUzZv';
  controls: ControlsConfig<EyeConfig> = [
    {
      key: 'n',
      label: 'Number of nails per side',
      defaultValue: 82,
      type: 'range',
      attr: { min: 3, max: 200, step: 1 },
      isStructural: true,
    },
    {
      key: 'layers',
      label: 'Layers',
      defaultValue: 13,
      type: 'range',
      attr: { min: 1, max: 20, step: 1 },
      isStructural: true,
    },
    {
      key: 'angle',
      label: 'Layer angle',
      defaultValue: 0.65,
      displayValue: ({ angle }) => `${angle}°`,
      type: 'range',
      attr: { min: 0.01, max: 1, step: 0.01 },
      isStructural: true,
      show: ({ layers }) => layers > 1,
    },
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        color: '#ffffff',
        multicolorRange: 107,
        multicolorStart: 226,
        multicolorByLightness: false,
        minLightness: 40,
        maxLightness: 50,
        colorCount: 2,
      },
      customControls: [
        {
          key: 'colorPerLayer',
          label: 'Color per layer',
          defaultValue: false,
          type: 'checkbox',
          show: ({ isMultiColor }) => isMultiColor,
          affectsNails: false,
        },
      ],
      exclude: ['colorCount', 'repeatColors'],
    }),
  ];

  defaultValues: Partial<Config<EyeConfig>> = {
    nailsColor: '#000000',
  };

  color: Color;

  getCalc({ size }: CalcOptions): TCalc {
    const { n, angle, layers: layerCount, margin } = this.config;
    const center = getCenter(size);

    const maxSize = Math.min(...size) - 2 * margin;
    const nailSpacing = maxSize / (n - 1);
    const spacesChangePerLayer = Math.max(1, Math.round((angle * n) / 2));
    const maxLayersCount = Math.floor((n - 1) / spacesChangePerLayer) + 1;
    const layersCount = Math.min(layerCount, maxLayersCount);

    const SIDES = 4;
    const piSides = Math.PI / SIDES;

    const layers: Layer[] = new Array(layersCount)
      .fill(null)
      .reduce((layers: Layer[], _, layerIndex) => {
        const previousLayer = layerIndex ? layers[layerIndex - 1] : null;

        if (
          layerIndex &&
          (!previousLayer ||
            previousLayer.layerSpaceCount <= spacesChangePerLayer)
        ) {
          return layers;
        }

        const layerAngle = layerIndex
          ? Math.atan(
              spacesChangePerLayer /
                (previousLayer.layerSpaceCount - spacesChangePerLayer)
            )
          : 0;

        const layerSize = layerIndex
          ? maxSize /
            Math.pow(Math.cos(layerAngle) + Math.sin(layerAngle), layerIndex)
          : maxSize;

        const layerSideNailCount = Math.trunc(layerSize / nailSpacing);

        const polygonSideSize = layerIndex ? previousLayer.layerSize : maxSize;
        const radius = layerIndex
          ? (previousLayer.polygon.config.radius * Math.cos(piSides)) /
            Math.cos(layerAngle - piSides)
          : Math.hypot(polygonSideSize / 2, polygonSideSize / 2);

        const polygon = new Polygon({
          size: [polygonSideSize, polygonSideSize],
          radius,
          sides: SIDES,
          nailsPerSide: layerSideNailCount,
          rotation:
            layerAngle / PI2 + (previousLayer?.polygon.config.rotation ?? 0),
          center,
        });
        const layer: Layer = {
          layerAngle: layerAngle * layerIndex,
          layerSize,
          layerSideNailCount,
          layerSpaceCount: layerSideNailCount - 1,
          polygon,
        };

        return [...layers, layer];
      }, [] as Layer[]);

    const layersIndexStart = layers
      .reduce(
        (result, { polygon }, i) => [
          ...result,
          result[i] +
            polygon.getNailsCount({ drawCenter: false, drawCenterNail: false }),
        ],
        [0]
      )
      .slice(0, layers.length);
    return {
      maxSize,
      nailSpacing,
      layers,
      center,
      layersIndexStart,
      layersCount,
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    this.color = new Color({
      ...this.config,
      repeatColors: true,
      colorCount: 2,
    });
  }

  getAspectRatio(): number {
    return 1;
  }

  *drawSide(
    renderer: Renderer,
    {
      side,
      color = '#ffffff',
      layerSideNailCount,
      layerIndexStart,
    }: {
      side: number;
      color: ColorValue;
      layerSideNailCount: number;
      layerIndexStart: number;
    }
  ): Generator<void> {
    const nextSide = (side + 1) % 4;
    renderer.setColor(color);

    for (let i = 0; i < layerSideNailCount; i++) {
      const nonSideStart = layerIndexStart + i;

      renderer.renderLine(
        this.nails.getNailCoordinates(nonSideStart + side * layerSideNailCount),
        this.nails.getNailCoordinates(
          nonSideStart + nextSide * layerSideNailCount
        )
      );

      yield;
    }
  }

  *drawLayer(renderer: Renderer, layerIndex: number): Generator<void> {
    const { colorPerLayer } = this.config;

    const { layerSpaceCount } = this.calc.layers[layerIndex];

    const layerIndexStart = this.calc.layersIndexStart[layerIndex];

    for (let i = 0; i < SIDES.length; i++) {
      yield* this.drawSide(renderer, {
        color: this.color.getColor(colorPerLayer ? layerIndex : i),
        side: i,
        layerSideNailCount: layerSpaceCount,
        layerIndexStart,
      });
    }
  }

  *drawStrings(renderer: Renderer) {
    for (let layer = this.calc.layers.length - 1; layer >= 0; layer--) {
      yield* this.drawLayer(renderer, layer);
    }
  }

  getStepCount({ size }: CalcOptions) {
    let count = 0;
    const { layers, angle, n, margin } = this.config;
    const layerAngle = (angle * Math.PI) / 180;
    const maxSize = Math.min(...size) - 2 * margin;
    const nailSpacing = maxSize / (n - 1);

    const spacesChangePerLayer = Math.round((angle * n) / 2);
    const maxLayersCount = Math.floor((n - 1) / spacesChangePerLayer) + 1;
    const layersCount = Math.min(layers, maxLayersCount);

    for (let layer = 0; layer < layersCount; layer++) {
      const layerSize =
        maxSize / Math.pow(Math.cos(layerAngle) + Math.sin(layerAngle), layer);
      count += 4 * (Math.round(layerSize / nailSpacing) + 1);
    }

    return count;
  }

  // getNailCount(size: Dimensions): number {
  //   return this.#getNailCount(this.calc ?? this.getCalc({ size }));
  // }

  // #getNailCount({ layers }: TCalc): number {
  //   return layers.reduce(
  //     (nailCount: number, layer) =>
  //       nailCount + (layer.layerSideNailCount + 1) * SIDES.length,
  //     0
  //   );
  // }
  drawNails(nails: INails) {
    const { layers } = this.config;

    for (let layer = 0; layer < this.calc.layersCount; layer++) {
      const { polygon } = this.calc.layers[layer];
      polygon.drawNails(nails, {
        getUniqueKey: k => this.calc.layersIndexStart[layer] + k,
      });
    }
  }

  thumbnailConfig = ({ n, layers }) => ({
    n: Math.min(n, 25),
    layers: Math.min(layers, 7),
  });
}

export default Eye;
