import Color from '../helpers/color/Color';
import { ColorConfig, ColorValue } from '../helpers/color/color.types';
import { PI2 } from '../helpers/math_utils';
import { getCenter } from '../helpers/size_utils';
import Controller from '../infra/Controller';
import NailsSetter from '../infra/nails/NailsSetter';
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
  layerIndexStart: number;
  polygon: Polygon;
  nailSpacing: number;
}
interface TCalc {
  nailSpacing: number;
  layers: ReadonlyArray<Layer>;
  center: Coordinates;
  layersCount: number;
  totalNailsCount: number;
}

class Eye extends StringArt<EyeConfig, TCalc> {
  static type = 'eye';

  name = 'Vortex';
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
        repeatColors: true,
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

    const nailSpacing = basePolygon.sideSize / (n - 1);
    const spacesChangePerLayer = Math.max(1, Math.floor((angle * n) / 2));
    const piSides = Math.PI / sides;

    const layers: Layer[] = [
      {
        polygon: basePolygon,
        layerAngle: 0,
        layerSize: basePolygon.sideSize,
        layerSideNailCount: n,
        layerSpaceCount: n - 1,
        layerIndexStart: 0,
        nailSpacing,
      },
    ];

    let totalNailsCount = basePolygon.getNailsCount();

    for (let layerIndex = 1; layerIndex < layerCount; layerIndex++) {
      const previousLayer = layers[layerIndex - 1];
      const spaces = previousLayer
        ? Math.max(
            1,
            Math.floor((angle * previousLayer.layerSideNailCount) / 2)
          )
        : spacesChangePerLayer;

      if (
        !previousLayer ||
        previousLayer.layerSpaceCount <= 3 ||
        previousLayer.layerSpaceCount <= spaces
      ) {
        break;
      }

      const layerAngle =
        Math.PI / sides -
        Math.atan(
          (previousLayer.nailSpacing *
            (previousLayer.layerSpaceCount / 2 - spaces)) /
            previousLayer.polygon.getApothem()
        );

      if (layerAngle <= 0) {
        break;
      }

      const radius =
        (previousLayer.polygon.radius * Math.cos(piSides)) /
        Math.cos(layerAngle - piSides);

      const layerSize = 2 * radius * Math.sin(Math.PI / sides);

      let layerSideNailCount = Math.ceil(layerSize / nailSpacing);

      if (angle === 1 && !(layerSideNailCount % 2)) {
        layerSideNailCount--;
      }

      if (layerSideNailCount < 3) {
        break;
      }

      const layerIndexStart = totalNailsCount;

      const polygon = new Polygon({
        size,
        sides,
        nailsPerSide: layerSideNailCount,
        rotation:
          layerAngle / PI2 + (previousLayer?.polygon.config.rotation ?? 0),
        center: layers[0].polygon.center,
        radius,
        getUniqueKey: layerIndexStart ? k => layerIndexStart + k : undefined,
      });

      totalNailsCount += polygon.getNailsCount();

      const layerSpaceCount = layerSideNailCount - 1;

      layers.push({
        layerAngle: layerAngle * layerIndex,
        layerSize,
        layerSideNailCount,
        layerSpaceCount,
        polygon,
        nailSpacing: layerSize / layerSpaceCount,
        layerIndexStart,
      });
    }
    const layersCount = layers.length;

    return {
      nailSpacing,
      layers,
      center,
      totalNailsCount,
      layersCount,
    };
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    this.color = new Color(this.config);
  }

  getAspectRatio(): number {
    return 1;
  }

  *drawSide(
    controller: Controller,
    {
      side,
      color = '#ffffff',
      layer,
    }: {
      side: number;
      color: ColorValue;
      layer: Layer;
    }
  ): Generator<void> {
    const nextSide = (side + 1) % this.config.sides;
    controller.startLayer({ color });

    for (let i = 0; i < layer.layerSpaceCount; i++) {
      controller.goto(layer.polygon.getSideNailIndex(side, i));
      controller.stringTo(layer.polygon.getSideNailIndex(nextSide, i));
      yield;
    }
  }

  *#drawLayer(controller: Controller, layerIndex: number): Generator<void> {
    const { colorPerLayer, sides } = this.config;

    for (let i = 0; i < sides; i++) {
      yield* this.drawSide(controller, {
        color: this.color.getColor(colorPerLayer ? layerIndex : i),
        side: i,
        layer: this.calc.layers[layerIndex],
      });
    }
  }

  *drawStrings(controller: Controller) {
    for (let layer = this.calc.layers.length - 1; layer >= 0; layer--) {
      yield* this.#drawLayer(controller, layer);
    }
  }

  getStepCount(options: CalcOptions) {
    return (this.calc ?? this.getCalc(options)).totalNailsCount;
  }

  drawNails(nails: NailsSetter) {
    for (let layer = 0; layer < this.calc.layersCount; layer++) {
      const { polygon } = this.calc.layers[layer];
      polygon.drawNails(nails);
    }
  }

  thumbnailConfig = ({ n, layers }) => ({
    n: Math.min(n, 25),
    layers: Math.min(layers, 7),
  });
}

export default Eye;
