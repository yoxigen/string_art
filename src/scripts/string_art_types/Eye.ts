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

interface EyeConfig extends ColorConfig {
  n: number;
  sides: number;
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
  nailSpacing: number;
}
interface TCalc {
  maxSize: number;
  nailSpacing: number;
  layers: ReadonlyArray<Layer>;
  center: Coordinates;
  layersIndexStart: ReadonlyArray<number>;
  layersCount: number;
  totalNailsCount: number;
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
      key: 'sides',
      label: 'Sides',
      defaultValue: 4,
      type: 'range',
      attr: { min: 3, max: 10, step: 1 },
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
      displayValue: ({ angle, sides }) =>
        `${Math.round((180 * angle) / sides)}°`,
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
    const {
      n: nConfig,
      angle,
      layers: layerCount,
      margin = 0,
      sides,
    } = this.config;
    const center = getCenter(size);
    // If the angle is 1 (meaning a inner polygon reaches the middle of an outter polygon), making sure the number of nails per side is odd, so there's a middle nail
    const n = !(nConfig % 2) ? nConfig + 1 : nConfig;
    const basePolygon = new Polygon({
      size,
      sides,
      nailsPerSide: n,
      center,
      fitSize: true,
      margin,
    });

    const maxSize = Math.min(...size) - 2 * margin;
    const nailSpacing = maxSize / (n - 1);
    const spacesChangePerLayer = Math.max(1, Math.floor((angle * n) / 2));
    const piSides = Math.PI / sides;

    const layers: Layer[] = new Array(layerCount).fill(null).reduce(
      (layers: Layer[], _, layerIndex) => {
        const previousLayer = layerIndex ? layers[layerIndex - 1] : null;
        const spaces = previousLayer
          ? Math.max(
              1,
              Math.floor((angle * previousLayer.layerSideNailCount) / 2)
            )
          : spacesChangePerLayer;

        if (
          layerIndex &&
          (!previousLayer ||
            previousLayer.layerSpaceCount <= 3 ||
            previousLayer.layerSpaceCount <= spaces)
        ) {
          return layers;
        }

        const layerAngle = layerIndex
          ? Math.PI / sides -
            Math.atan(
              (previousLayer.nailSpacing *
                (previousLayer.layerSpaceCount / 2 - spaces)) /
                previousLayer.polygon.getApothem()
            )
          : 0;

        if (layerIndex && layerAngle <= 0) {
          return layers;
        }
        if (layerIndex === 1) {
          console.log('LAYER SPACES', {
            spaces,
            prev: previousLayer.layerSideNailCount,
            layerAngle: (180 * layerAngle) / Math.PI,
          });
        }

        const layerSize = layerIndex
          ? maxSize /
            Math.pow(Math.cos(layerAngle) + Math.sin(layerAngle), layerIndex)
          : maxSize;

        let layerSideNailCount = layerIndex
          ? Math.trunc(layerSize / nailSpacing)
          : n;

        if (angle === 1 && !(layerSideNailCount % 2)) {
          layerSideNailCount--;
        }

        if (layerSideNailCount < 3) {
          return layers;
        }

        const polygonSideSize = layerIndex ? previousLayer.layerSize : maxSize;
        const radius = layerIndex
          ? (previousLayer.polygon.radius * Math.cos(piSides)) /
            Math.cos(layerAngle - piSides)
          : null;

        const polygon = new Polygon({
          size: layerIndex === 0 ? size : [polygonSideSize, polygonSideSize],
          sides,
          nailsPerSide: layerSideNailCount,
          rotation:
            layerAngle / PI2 + (previousLayer?.polygon.config.rotation ?? 0),
          center: layerIndex ? layers[0].polygon.center : center,
          fitSize: layerIndex === 0,
          radius,
          margin: margin ?? 0,
        });
        const layerSpaceCount = layerSideNailCount - 1;

        const layer: Layer = {
          layerAngle: layerAngle * layerIndex,
          layerSize,
          layerSideNailCount,
          layerSpaceCount,
          polygon,
          nailSpacing: layerIndex ? layerSize / layerSpaceCount : nailSpacing,
        };

        return [...layers, layer];
      },
      [
        {
          polygon: basePolygon,
          layerAngle: 0,
          layerSize: basePolygon.sideSize,
          layerSideNailCount: n,
          layerSpaceCount: n - 1,
          nailSpacing,
        },
      ] as Layer[]
    );

    const layersCount = layers.length;

    const layersIndexStart = layers.reduce(
      (result, { polygon }, i) => [
        ...result,
        result[i] + polygon.getNailsCount(),
      ],
      [0]
    );

    return {
      maxSize,
      nailSpacing,
      layers,
      center,
      totalNailsCount: layersIndexStart[layersIndexStart.length - 1],
      layersIndexStart: layersIndexStart.slice(0, layers.length),
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
    const nextSide = (side + 1) % this.config.sides;
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
    const { colorPerLayer, sides } = this.config;

    const { layerSpaceCount } = this.calc.layers[layerIndex];

    const layerIndexStart = this.calc.layersIndexStart[layerIndex];

    for (let i = 0; i < sides; i++) {
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

  getStepCount(options: CalcOptions) {
    return (this.calc ?? this.getCalc(options)).totalNailsCount;
  }

  drawNails(nails: INails) {
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
