import Color from '../helpers/color/Color.js';
import { ColorConfig, ColorValue } from '../helpers/color/color.types';
import StringArt from '../StringArt';
import { Config, ControlsConfig, GroupValue } from '../types/config.types';
import { Coordinates } from '../types/general.types';

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
  layerStart: Coordinates;
  layerStringCount: number;
}
interface TCalc {
  maxSize: number;
  nailSpacing: number;
  layerAngle: number;
  layers: ReadonlyArray<Layer>;
}

class Eye extends StringArt<EyeConfig> {
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
      attr: { min: 2, max: 200, step: 1 },
    },
    {
      key: 'layers',
      label: 'Layers',
      defaultValue: 13,
      type: 'range',
      attr: { min: 1, max: 20, step: 1 },
    },
    {
      key: 'angle',
      label: 'Layer angle',
      defaultValue: 30,
      displayValue: ({ angle }) => `${angle}°`,
      type: 'range',
      attr: { min: 0, max: 45, step: 1 },
    },
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        color: '#ffffff',
        multicolorRange: 214,
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
        },
      ],
      exclude: ['colorCount', 'repeatColors'],
    }),
  ];

  defaultValues: Partial<Config<EyeConfig>> = {
    nailsColor: '#000000',
  };

  #calc: TCalc;
  color: Color;

  getCalc(): TCalc {
    const { n, angle, layers, margin } = this.config;

    const maxSize = Math.min(...this.size) - 2 * margin;
    const nailSpacing = maxSize / (n - 1);
    const layerAngle = (angle * Math.PI) / 180;

    const getLayerProps = (layerIndex: number): Layer => {
      const layerSize =
        maxSize /
        Math.pow(Math.cos(layerAngle) + Math.sin(layerAngle), layerIndex);
      const layerStart: Coordinates = [
        this.center[0] - layerSize / 2,
        this.center[1] - layerSize / 2,
      ];
      const layerStringCount = Math.floor(layerSize / nailSpacing);

      return {
        layerAngle: layerAngle * layerIndex,
        layerSize,
        layerStart,
        layerStringCount,
      };
    };

    return {
      maxSize,
      nailSpacing,
      layerAngle,
      layers: new Array(layers)
        .fill(null)
        .map((_, layerIndex) => getLayerProps(layerIndex)),
    };
  }

  setUpDraw() {
    super.setUpDraw();
    this.color = new Color({
      ...this.config,
      repeatColors: true,
      colorCount: 2,
    });
    this.#calc = this.getCalc();
  }

  // Sides: top, right, bottom, left
  getPoint({
    index,
    angle,
    layerStart,
    rotation,
  }: {
    index: number;
    angle: number;
    layerStart: Coordinates;
    rotation: number;
  }): Coordinates {
    const theta = angle + rotation;

    const point: Coordinates = [
      layerStart[0],
      layerStart[1] + this.#calc.nailSpacing * index,
    ];

    const pivot = this.center;

    const cosAngle = Math.cos(theta);
    const sinAngle = Math.sin(theta);

    return [
      cosAngle * (point[0] - pivot[0]) -
        sinAngle * (point[1] - pivot[1]) +
        pivot[0],
      sinAngle * (point[0] - pivot[0]) +
        cosAngle * (point[1] - pivot[1]) +
        pivot[1],
    ];
  }

  *drawSide({
    side,
    color = '#ffffff',
    angle,
    size,
    layerStart,
    layerStringCount,
  }: {
    side: Side;
    color: ColorValue;
    angle: number;
    size: number;
    layerStart: Coordinates;
    layerStringCount: number;
  }): Generator<void> {
    const sideIndex = SIDES.indexOf(side);
    const nextSide = SIDES[sideIndex === SIDES.length - 1 ? 0 : sideIndex + 1];
    const rotation = SIDES_ROTATION[side];
    const nextSideRotation = SIDES_ROTATION[nextSide];

    const sideProps = { layerStringCount, size, layerStart, angle };
    this.renderer.setColor(color);

    for (let i = 0; i <= layerStringCount; i++) {
      this.renderer.renderLines(
        this.getPoint({ index: i, rotation, ...sideProps }),
        this.getPoint({
          index: i,
          rotation: nextSideRotation,
          ...sideProps,
        })
      );

      yield;
    }
  }

  *drawLayer(layerIndex: number): Generator<void> {
    const { colorPerLayer } = this.config;

    const { layerAngle, layerSize, layerStart, layerStringCount } =
      this.#calc.layers[layerIndex];

    for (let i = 0; i < SIDES.length; i++) {
      yield* this.drawSide({
        color: this.color.getColor(colorPerLayer ? layerIndex : i),
        side: SIDES_ORDER[i],
        angle: layerAngle,
        size: layerSize,
        layerStart,
        layerStringCount,
      });
    }
  }

  *generateStrings() {
    const { layers } = this.config;
    for (let layer = layers - 1; layer >= 0; layer--) {
      yield* this.drawLayer(layer);
    }
  }

  getStepCount() {
    let count = 0;
    const { layers, angle, n, margin } = this.config;
    const layerAngle = (angle * Math.PI) / 180;
    const maxSize = Math.min(...this.renderer.getSize()) - 2 * margin;
    const nailSpacing = maxSize / (n - 1);

    for (let layer = 0; layer < layers; layer++) {
      const layerSize =
        maxSize / Math.pow(Math.cos(layerAngle) + Math.sin(layerAngle), layer);
      count += 4 * (Math.floor(layerSize / nailSpacing) + 1);
    }

    return count;
  }

  drawNails() {
    const { layers } = this.config;
    for (let layer = layers - 1; layer >= 0; layer--) {
      const {
        layerAngle: angle,
        layerSize: size,
        layerStart,
        layerStringCount,
      } = this.#calc.layers[layer];

      for (let s = 0; s < SIDES.length; s++) {
        const sideOrder = SIDES_ORDER[s];
        const rotation = SIDES_ROTATION[sideOrder];

        for (let i = 0; i <= layerStringCount; i++) {
          const sideProps = { layerStringCount, size, layerStart, angle };
          this.nails.addNail({
            point: this.getPoint({
              index: i,
              rotation,
              ...sideProps,
            }),
            number: `${layer}_${s}_${i}`,
          });
        }
      }
    }
  }

  static thumbnailConfig = {
    n: 25,
    layers: 7,
  };
}

export default Eye;
