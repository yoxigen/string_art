import StringArt from '../infra/StringArt';
import Circle from '../shapes/Circle';
import { ColorValue } from '../helpers/color/color.types';
import Renderer from '../infra/renderers/Renderer';
import {
  ControlConfig,
  ControlsConfig,
  ControlType,
  GroupValue,
} from '../types/config.types';
import { Coordinates } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';
import { formatFractionAsAngle } from '../helpers/string_utils';
import NailsSetter from '../infra/nails/NailsSetter';
import { createArray } from '../helpers/array_utils';

interface FreestyleConfig {
  color: ColorValue;
  layers: GroupValue;

  layer1: GroupValue;
  show1: boolean;
  radius1: number;
  x1: number;
  y1: number;
  rotation1: number;
  reverse1: boolean;
  n1: number;

  layer2: GroupValue;
  show2: boolean;
  radius2: number;
  x2: number;
  y2: number;
  rotation2: number;
  reverse2: boolean;
  n2: number;

  layer3: GroupValue;
  show3: boolean;
  radius3: number;
  x3: number;
  y3: number;
  rotation3: number;
  reverse3: boolean;
  n3: number;
}

const rotationConfig = {
  label: 'Rotation',
  defaultValue: 0,
  type: 'range' as ControlType,
  attr: {
    min: 0,
    max: 1 + 1 / 360,
    step: 1 / 360,
  },
  isStructural: true,
  affectsStepCount: false,
};

interface Layer {
  circle: Circle;
  enable: boolean;
  isReverse: boolean;
  position: Coordinates;
  radius: number;
  rotation: number;
}

interface TCalc {
  layers: ReadonlyArray<Layer>;
  roundsCount: number;
}

function getCircleConfig(i: number) {
  const show = (config: FreestyleConfig) => config[`show${i}`];

  return {
    key: `layer${i}`,
    label: `Layer ${i}`,
    type: 'group',
    children: [
      {
        key: `show${i}`,
        label: 'Enable',
        defaultValue: true,
        type: 'checkbox',
        isStructural: true,
      },
      {
        key: `n${i}`,
        label: 'Nails count',
        type: 'range',
        attr: { min: 1, max: 300, step: 1 },
        show,
        isStructural: true,
      },
      {
        key: `radius${i}`,
        label: 'Radius',
        type: 'range',
        attr: { min: 0.01, max: 1, step: 0.01 },
        show,
        isStructural: true,
      },
      {
        key: `x${i}`,
        label: 'Position X',
        type: 'range',
        attr: { min: 0, max: 1, step: 0.01 },
        show,
        isStructural: true,
      },
      {
        key: `y${i}`,
        label: 'Position Y',
        type: 'range',
        attr: { min: 0, max: 1, step: 0.01 },
        show,
        isStructural: true,
      },
      {
        ...rotationConfig,
        key: `rotation${i}`,
        displayValue: ({ rotation1 }) => formatFractionAsAngle(rotation1),
        show,
      },
      {
        key: `reverse${i}`,
        label: 'Reverse',
        type: 'checkbox',
        isStructural: true,
        show,
      },
    ],
  };
}

export default class Freestyle extends StringArt<FreestyleConfig, TCalc> {
  static type = 'freestyle';

  name = 'Freestyle';
  id = 'freestyle';
  link =
    'https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for';
  controls: ControlsConfig<FreestyleConfig> = [
    {
      key: 'color',
      label: 'Color',
      defaultValue: '#ec6ad0',
      type: 'color',
      affectsNails: false,
      affectsStepCount: false,
    },
    {
      key: 'layers',
      label: 'Layers',
      type: 'group',
      // @ts-ignore
      children: createArray(3, i => getCircleConfig(i + 1)),
    },
  ];

  defaultValues: Partial<FreestyleConfig> = {
    n1: 80,
    n2: 80,
    n3: 80,
    radius1: 0.5,
    radius2: 0.5,
    radius3: 0.5,
    x1: 0.5,
    x2: 0,
    x3: 1,
    y1: 0,
    y2: 1,
    y3: 1,
    reverse1: false,
    reverse2: false,
    reverse3: false,
  };

  getAspectRatio({ size }: CalcOptions): number {
    // TODO: Move the aspect ratio of this pattern to a config, then remove the options param from StringArt.getAspectRatio.
    return size[0] / size[1];
  }

  getCalc({ size }: CalcOptions): TCalc {
    const { margin = 0 } = this.config;

    const maxRadius = Math.min(...size.map(v => v - 2 * margin)) / 2;
    const layers = createArray(3, i => getLayer.call(this, i + 1)).filter(
      ({ enable }) => enable
    );

    return {
      layers,
      roundsCount: Math.max(...layers.map(l => l.circle.config.n)),
    };

    function getLayer(layerIndex: number): Layer {
      const prop = (prop: string) => this.config[prop + layerIndex];

      const props = {
        enable: prop('show'),
        isReverse: prop('reverse'),
        position: [prop('x'), prop('y')] as Coordinates,
        radius: maxRadius * prop('radius'),
        rotation: prop('rotation'),
      };

      const circle = new Circle({
        radius: props.radius,
        size,
        center: props.position.map(
          (v, i) =>
            props.radius + margin + (size[i] - (props.radius + margin) * 2) * v
        ) as Coordinates,
        n: prop('n'),
        rotation: props.rotation,
        reverse: props.isReverse,
      });

      return {
        circle,
        ...props,
      };
    }
  }

  getPoint(layer: Layer, index: number): Coordinates {
    return layer.circle.getPoint(index);
  }

  *drawStrings(renderer: Renderer): Generator<void> {
    const { color } = this.config;

    renderer.setColor(color);
    let prevCirclePoint: Coordinates;

    for (let i = 0; i < this.calc.roundsCount; i++) {
      for (
        let layerIndex = 0;
        layerIndex < this.calc.layers.length;
        layerIndex++
      ) {
        const layer = this.calc.layers[layerIndex];
        const startPoint = prevCirclePoint ?? this.getPoint(layer, i);

        const positions: Coordinates[] = [];
        if (layerIndex === 0 && i) {
          positions.push(this.getPoint(layer, i));
        }

        let nextLayerIndex = layerIndex + 1;
        if (nextLayerIndex === this.calc.layers.length) {
          nextLayerIndex = 0;
        }

        prevCirclePoint = this.getPoint(this.calc.layers[nextLayerIndex], i);

        renderer.renderLine(startPoint, prevCirclePoint);
        yield;
      }
    }
  }

  drawNails(nails: NailsSetter) {
    this.calc.layers.forEach(({ circle }, i) =>
      circle.drawNails(nails, { getUniqueKey: k => 1e3 * i + k })
    );
  }

  getStepCount(options: CalcOptions) {
    const { layers, roundsCount } = this.getCalc(options);
    return layers.length * roundsCount;
  }

  getNailsCount(): number {
    const { n1, n2, n3 } = this.config;
    return n1 + n2 + n3;
  }

  thumbnailConfig = ({ n1, n2, n3 }) => ({
    n1: Math.min(n1, 40),
    n2: Math.min(n2, 40),
    n3: Math.min(n3, 40),
  });
}
