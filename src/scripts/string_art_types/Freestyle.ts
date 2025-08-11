import StringArt from '../StringArt';
import Circle from '../helpers/Circle';
import { ColorValue } from '../helpers/color/color.types';
import {
  ControlConfig,
  ControlsConfig,
  ControlType,
  GroupValue,
} from '../types/config.types';
import { Coordinates } from '../types/general.types';

interface FreestyleConfig {
  n: number;
  minNailDistance: number;
  color: ColorValue;
  layers: GroupValue;

  layer1: GroupValue;
  show1: boolean;
  radius1: number;
  x1: number;
  y1: number;
  rotation1: number;
  reverse1: boolean;

  layer2: GroupValue;
  show2: boolean;
  radius2: number;
  x2: number;
  y2: number;
  rotation2: number;
  reverse2: boolean;

  layer3: GroupValue;
  show3: boolean;
  radius3: number;
  x3: number;
  y3: number;
  rotation3: number;
  reverse3: boolean;
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
  maxShapeNailsCount: number;
}

export default class Freestyle extends StringArt<FreestyleConfig> {
  static type = 'freestyle';

  name = 'Freestyle';
  id = 'freestyle';
  link =
    'https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for';
  controls: ControlsConfig<FreestyleConfig> = [
    {
      key: 'n',
      label: 'Circle nails',
      defaultValue: 80,
      type: 'range',
      attr: { min: 1, max: 300, step: 1 },
    },
    {
      key: 'minNailDistance',
      label: 'Min nail distance',
      defaultValue: 20,
      type: 'range',
      attr: { min: 1, max: 300, step: 1 },
    },
    {
      key: 'color',
      label: 'Color',
      defaultValue: '#ec6ad0',
      type: 'color',
    },
    {
      key: 'layers',
      label: 'Layers',
      type: 'group',
      children: [
        {
          key: 'layer1',
          label: 'Layer 1',
          type: 'group',
          children: [
            {
              key: 'show1',
              label: 'Enable',
              defaultValue: true,
              type: 'checkbox',
            },
            {
              key: 'radius1',
              label: 'Radius',
              defaultValue: 0.5,
              type: 'range',
              attr: { min: 0.01, max: 1, step: 0.01 },
              show: ({ show1 }) => show1,
            },
            {
              key: 'x1',
              label: 'Position X',
              defaultValue: 0.5,
              type: 'range',
              attr: { min: 0, max: 1, step: 0.01 },
              show: ({ show1 }) => show1,
            },
            {
              key: 'y1',
              label: 'Position Y',
              defaultValue: 0,
              type: 'range',
              attr: { min: 0, max: 1, step: 0.01 },
              show: ({ show1 }) => show1,
            },
            {
              ...rotationConfig,
              key: 'rotation1',
              show: ({ show1 }) => show1,
              displayValue: ({ rotation1 }) =>
                `${Math.round(rotation1 * 360)}°`,
            },
            {
              key: 'reverse1',
              label: 'Reverse',
              defaultValue: false,
              type: 'checkbox',
              show: ({ show1 }) => show1,
            },
          ],
        },
        {
          key: 'layer2',
          label: 'Layer 2',
          type: 'group',
          children: [
            {
              key: 'show2',
              label: 'Enable',
              defaultValue: true,
              type: 'checkbox',
            },
            {
              key: 'radius2',
              label: 'Radius',
              defaultValue: 0.5,
              type: 'range',
              attr: { min: 0.01, max: 1, step: 0.01 },
              show: ({ show2 }) => show2,
            },
            {
              key: 'x2',
              label: 'Position X',
              defaultValue: 0,
              type: 'range',
              attr: { min: 0, max: 1, step: 0.01 },
              show: ({ show2 }) => show2,
            },
            {
              key: 'y2',
              label: 'Position Y',
              defaultValue: 1,
              type: 'range',
              attr: { min: 0, max: 1, step: 0.01 },
              show: ({ show2 }) => show2,
            },
            {
              ...rotationConfig,
              key: 'rotation2',
              show: ({ show2 }) => show2,
              displayValue: ({ rotation2 }) =>
                `${Math.round(rotation2 * 360)}°`,
            },
            {
              key: 'reverse2',
              label: 'Reverse',
              defaultValue: false,
              type: 'checkbox',
              show: ({ show2 }) => show2,
            },
          ],
        },
        {
          key: 'layer3',
          label: 'Layer 3',
          type: 'group',
          children: [
            {
              key: 'show3',
              label: 'Enable',
              defaultValue: true,
              type: 'checkbox',
            },
            {
              key: 'radius3',
              label: 'Radius',
              defaultValue: 0.5,
              type: 'range',
              attr: { min: 0.01, max: 1, step: 0.01 },
              show: ({ show3 }) => show3,
            },
            {
              key: 'x3',
              label: 'Position X',
              defaultValue: 1,
              type: 'range',
              attr: { min: 0, max: 1, step: 0.01 },
              show: ({ show3 }) => show3,
            },
            {
              key: 'y3',
              label: 'Position Y',
              defaultValue: 1,
              type: 'range',
              attr: { min: 0, max: 1, step: 0.01 },
              show: ({ show3 }) => show3,
            },
            {
              ...rotationConfig,
              key: 'rotation3',
              show: ({ show3 }) => show3,
              displayValue: ({ rotation3 }) =>
                `${Math.round(rotation3 * 360)}°`,
            },
            {
              key: 'reverse3',
              label: 'Reverse',
              defaultValue: false,
              type: 'checkbox',
              show: ({ show3 }) => show3,
            },
          ],
        },
      ],
    },
  ];

  #calc: TCalc;

  setUpDraw() {
    super.setUpDraw();
    this.#calc = this.getCalc();
  }

  getCalc(): TCalc {
    const { n, margin = 0, minNailDistance } = this.config;
    const size = this.getSize();

    const maxRadius = Math.min(...size.map(v => v - 2 * margin)) / 2;
    const layers = new Array(3)
      .fill(null)
      .map((_, i) => getLayer.call(this, i + 1))
      .filter(({ enable }) => enable);

    const maxShapeNailsCount = Math.max(
      ...layers.map(({ circle }) => circle.config.n)
    );

    return {
      layers,
      maxShapeNailsCount,
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

      const circumsference = Math.PI * 2 * props.radius;
      const circleNails = Math.min(
        n,
        Math.floor(circumsference / minNailDistance)
      );

      const circle = new Circle({
        radius: props.radius,
        size: this.size,
        center: props.position.map(
          (v, i) =>
            props.radius + margin + (size[i] - (props.radius + margin) * 2) * v
        ) as Coordinates,
        n: circleNails,
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
    const { circle } = layer;
    let circleIndex = Math.round(
      (index * circle.config.n) / this.#calc.maxShapeNailsCount
    );
    return circle.getPoint(circleIndex);
  }

  *generateStrings(): Generator<void> {
    const { color } = this.config;

    this.renderer.setColor(color);
    let prevCirclePoint: Coordinates;

    for (let i = 0; i < this.#calc.maxShapeNailsCount; i++) {
      for (
        let layerIndex = 0;
        layerIndex < this.#calc.layers.length;
        layerIndex++
      ) {
        const layer = this.#calc.layers[layerIndex];
        const startPoint = prevCirclePoint ?? this.getPoint(layer, i);

        const positions: Coordinates[] = [];
        if (layerIndex === 0 && i) {
          positions.push(this.getPoint(layer, i));
        }

        let nextLayerIndex = layerIndex + 1;
        if (nextLayerIndex === this.#calc.layers.length) {
          nextLayerIndex = 0;
        }

        prevCirclePoint = this.getPoint(this.#calc.layers[nextLayerIndex], i);

        this.renderer.renderLines(startPoint, prevCirclePoint);
        yield;
      }
    }
  }

  drawNails() {
    this.#calc.layers.forEach(({ circle }, layerIndex) =>
      circle.drawNails(this.nails, {
        getNumber: i => `${layerIndex + 1}_${i + 1}`,
      })
    );
  }

  getStepCount() {
    const { layers, maxShapeNailsCount } = this.getCalc();
    return layers.length * maxShapeNailsCount - 1;
  }

  static thumbnailConfig = {
    minNailDistance: 3,
  };
}
