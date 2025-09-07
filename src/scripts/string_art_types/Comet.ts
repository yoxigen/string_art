import StringArt from '../StringArt.js';
import Circle, { CircleConfig } from '../helpers/Circle.js';
import Color from '../helpers/color/Color.js';
import { ColorConfig } from '../helpers/color/color.types.js';
import { PI2 } from '../helpers/math_utils.js';
import Renderer from '../renderers/Renderer.js';
import { ControlsConfig } from '../types/config.types.js';
import { CalcOptions } from '../types/stringart.types.js';

type SpreadModeType = 'evenly' | 'distance';

interface CometConfig extends CircleConfig, ColorConfig {
  layers: number;
  ringSize: number;
  layerSpread: SpreadModeType;
  layerDistance: number;
  colorPerLayer: boolean;
}

interface SpreadMode {
  f: (layerIndex: number, config: CometConfig) => number;
  name: string;
}

const spreadModes: Record<SpreadModeType, SpreadMode> = {
  evenly: {
    f: (layerIndex, { ringSize, layers, n }) => {
      const firstLayerDistance = Math.floor(n * ringSize);
      return Math.floor(((layers - layerIndex) * firstLayerDistance) / layers);
    },
    name: 'Evenly',
  },
  distance: {
    f: (layerIndex, { n, ringSize, layerDistance }) => {
      const firstLayerDistance = Math.floor(n * ringSize);

      if (layerIndex > 0) {
        return firstLayerDistance - layerIndex * layerDistance;
      }

      return firstLayerDistance;
    },
    name: 'Specific distance',
  },
};

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#ff0000',
    multicolorRange: 133,
    multicolorStart: 239,
    multicolorByLightness: false,
    minLightness: 30,
    maxLightness: 70,
    colorCount: 4,
  },
  customControls: [
    {
      key: 'colorPerLayer',
      label: 'Color per layer',
      defaultValue: true,
      type: 'checkbox',
      affectsNails: false,
    },
  ],
});

type TCalc = {
  circle: Circle;
};

export default class Comet extends StringArt<CometConfig> {
  static type = 'comet';

  name = 'Comet';
  id = 'comet';
  controls: ControlsConfig<CometConfig> = [
    Circle.nailsConfig,
    {
      key: 'layers',
      label: 'Layers',
      defaultValue: 5,
      type: 'range',
      attr: {
        min: 1,
        max: 20,
        step: 1,
      },
      isStructural: true,
    },
    {
      key: 'ringSize',
      label: 'First layer size',
      description:
        'Nail count from the top center nail to the first connected nail in the first layer',
      defaultValue: 0.3,
      type: 'range',
      attr: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      displayValue: ({ ringSize, n }) => Math.floor(n * ringSize),
      isStructural: true,
      affectsNails: false,
    },
    {
      key: 'layerSpread',
      label: 'Layer Spread',
      type: 'select',
      defaultValue: 'distance',
      options: Object.entries(spreadModes).map(([key, { name }]) => ({
        value: key,
        label: name,
      })),
      isStructural: true,
      affectsNails: false,
    },
    {
      key: 'layerDistance',
      label: 'Layer Distance',
      type: 'range',
      attr: {
        min: 1,
        max: ({ n, layers }) => Math.floor(n / 2 / layers),
        step: 1,
      },
      defaultValue: 1,
      isStructural: true,
      show: ({ layerSpread }) => layerSpread !== 'evenly',
      affectsNails: false,
    },
    Circle.rotationConfig,
    Circle.distortionConfig,
    Circle.displacementConfig,
    COLOR_CONFIG,
  ];

  defaultValues: Partial<CometConfig> = {
    n: 51,
    layers: 11,
    colorPerLayer: true,
    multicolorRange: 203,
    multicolorStart: 137,
    ringSize: 0.47,
    rotation: 90 / 360,
    distortion: 0.38,
    displacementFunc: 'fastInOut',
    displacementMag: 1.8,
    displacementFastArea: 0.43,
    layerSpread: 'distance',
    layerDistance: 1,
  };

  #circle: Circle;
  calc: TCalc;
  color: Color;

  getCalc(options: CalcOptions): TCalc {
    const circleConfig = {
      size: options.size,
      n: this.config.n,
      margin: this.config.margin,
      rotation: this.config.rotation,
      distortion: this.config.distortion,
      displacementFunc: this.config.displacementFunc,
      displacementMag: this.config.displacementMag,
      displacementFastArea: this.config.displacementFastArea,
    };

    return {
      circle: new Circle(circleConfig),
    };
  }

  resetStructure(): void {
    this.calc = null;
  }

  setUpDraw(options: CalcOptions) {
    super.setUpDraw(options);
    const circleConfig = {
      size: options.size,
      n: this.config.n,
      margin: this.config.margin,
      rotation: this.config.rotation,
      distortion: this.config.distortion,
      displacementFunc: this.config.displacementFunc,
      displacementMag: this.config.displacementMag,
      displacementFastArea: this.config.displacementFastArea,
    };

    if (!this.calc) {
      this.calc = this.getCalc(options);
    }

    if (!this.stepCount) {
      this.stepCount = this.getStepCount();
    }

    const { isMultiColor, colorCount, layers, colorPerLayer } = this.config;
    const realColorCount = isMultiColor
      ? colorPerLayer
        ? layers
        : Math.min(colorCount, layers)
      : 1;

    this.color = new Color({
      ...this.config,
      isMultiColor,
      colorCount: realColorCount,
    });
  }

  getAspectRatio(calcOptions: CalcOptions): number {
    const calc = this.getCalc(calcOptions);
    return calc.circle.aspectRatio;
  }

  getLayerRingDistance(layerIndex: number): number {
    const spread = spreadModes[this.config.layerSpread];
    if (!spread) {
      throw new Error(`Invalid spread mode, "${this.config.layerSpread}"!`);
    }

    return spread.f(layerIndex, this.config);
  }

  getLayerRingStepCount(layerIndex: number): number {
    const layerRingDistance = this.getLayerRingDistance(layerIndex);
    return (this.config.n - layerRingDistance + 1) * 2 - 1;
  }

  *drawLayer(renderer: Renderer, layerIndex = 0): Generator<void> {
    const { n } = this.config;
    const ringDistance = this.getLayerRingDistance(layerIndex);
    const stepCount = n - ringDistance + 1;

    let prevPoint = this.calc.circle.getPoint(0);
    let prevPointIndex = 0;
    renderer.setColor(this.color.getColor(layerIndex));

    for (let i = 0; i < n - ringDistance + 1; i++) {
      const pointIndex = i + ringDistance;
      const point = this.calc.circle.getPoint(pointIndex);

      renderer.renderLines(prevPoint, point);
      yield;

      if (i !== stepCount - 1) {
        prevPointIndex = i + 1;
        prevPoint = this.calc.circle.getPoint(prevPointIndex);

        renderer.renderLines(point, prevPoint);

        yield;
      }
    }
  }

  *drawStrings(renderer: Renderer) {
    for (let layer = 0; layer < this.config.layers; layer++) {
      yield* this.drawLayer(renderer, layer);
    }
  }

  getStepCount(): number {
    if (this.stepCount) {
      return this.stepCount;
    }

    const { layers } = this.config;
    return new Array(layers)
      .fill(0)
      .reduce(
        (totalStepCount, _, layerIndex) =>
          totalStepCount + this.getLayerRingStepCount(layerIndex),
        0
      );
  }

  drawNails() {
    this.calc.circle.drawNails(this.nails);
  }

  static thumbnailConfig = {
    n: 24,
    layers: 8,
  };
}
