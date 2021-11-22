import StringArt from '../StringArt.js';

const SIDES = ['left', 'bottom', 'right', 'top'];
const SIDES_ORDER = ['left', 'bottom', 'right', 'top'];

const SIDES_ROTATION = {
  left: 0,
  bottom: Math.PI / 2,
  right: Math.PI,
  top: Math.PI * 1.5,
};

class Eye extends StringArt {
  name = 'Eye';
  id = 'eye';
  link =
    'https://www.etsy.com/listing/489853161/rose-of-space-string-art-sacred-geometry?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=string+art&ref=sr_gallery_1&epik=dj0yJnU9WXNpM1BDTnNkLVBtcWdCa3AxN1J5QUZRY1FlbkJ5Z18mcD0wJm49ZXdJb2JXZmVpNVVwN1NKQ3lXMy10ZyZ0PUFBQUFBR0ZuUzZv';
  controls = [
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
    {
      key: 'color',
      label: 'Color',
      type: 'group',
      children: [
        {
          key: 'color1',
          label: 'String #1 color',
          defaultValue: '#11e8bd',
          type: 'color',
        },
        {
          key: 'color2',
          label: 'String #2 color',
          defaultValue: '#6fff52',
          type: 'color',
        },
        {
          key: 'colorPerLayer',
          label: 'Color per layer',
          defaultValue: false,
          type: 'checkbox',
        },
      ],
    },
  ];

  setUpDraw() {
    super.setUpDraw();

    const { n, angle, layers, margin } = this.config;

    this.maxSize = Math.min(...this.size) - 2 * margin;
    this.nailSpacing = this.maxSize / (n - 1);
    this.layerAngle = (angle * Math.PI) / 180;

    this.layers = new Array(layers)
      .fill(null)
      .map((_, layerIndex) => this._getLayerProps(layerIndex));
  }

  // Sides: top, right, bottom, left
  getPoint({ index, angle, layerStart, rotation }) {
    const theta = angle + rotation;

    const point = {
      x: layerStart.x,
      y: layerStart.y + this.nailSpacing * index,
    };

    const pivot = { x: this.center[0], y: this.center[1] };

    const cosAngle = Math.cos(theta);
    const sinAngle = Math.sin(theta);

    const position = [
      cosAngle * (point.x - pivot.x) - sinAngle * (point.y - pivot.y) + pivot.x,
      sinAngle * (point.x - pivot.x) + cosAngle * (point.y - pivot.y) + pivot.y,
    ];
    return position;
  }

  *drawSide({
    side,
    color = '#ffffff',
    angle,
    size,
    layerStart,
    layerStringCount,
  }) {
    const sideIndex = SIDES.indexOf(side);
    const nextSide = SIDES[sideIndex === SIDES.length - 1 ? 0 : sideIndex + 1];
    const rotation = SIDES_ROTATION[side];
    const nextSideRotation = SIDES_ROTATION[nextSide];

    const sideProps = { layerStringCount, size, layerStart, angle };

    for (let i = 0; i <= layerStringCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(
        ...this.getPoint({ side, index: i, rotation, ...sideProps })
      );
      this.ctx.lineTo(
        ...this.getPoint({
          side: nextSide,
          index: i,
          rotation: nextSideRotation,
          ...sideProps,
        })
      );
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
      yield i;
    }
  }

  _getLayerProps(layerIndex) {
    const colors = this._getLayerColors(layerIndex);
    const layerAngle = this.layerAngle * layerIndex;
    const layerSize =
      this.maxSize /
      Math.pow(
        Math.cos(this.layerAngle) + Math.sin(this.layerAngle),
        layerIndex
      );
    const layerStart = {
      x: this.center[0] - layerSize / 2,
      y: this.center[1] - layerSize / 2,
    };
    const layerStringCount = Math.floor(layerSize / this.nailSpacing);

    return {
      colors,
      layerAngle,
      layerSize,
      layerStart,
      layerStringCount,
    };
  }

  _getLayerColors(layerIndex) {
    const { color1, color2, colorPerLayer } = this.config;
    if (colorPerLayer) {
      const layerColor = layerIndex % 2 ? color1 : color2;
      return [layerColor, layerColor, layerColor, layerColor];
    } else {
      return [color2, color1, color2, color1];
    }
  }

  *drawLayer(layerIndex) {
    const { colors, layerAngle, layerSize, layerStart, layerStringCount } =
      this.layers[layerIndex];

    for (let i = 0; i < SIDES.length; i++) {
      yield* this.drawSide({
        color: colors[i],
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
    const maxSize =
      Math.min(this.canvas.clientWidth, this.canvas.clientHeight) - 2 * margin;
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
      } = this.layers[layer];

      for (let s = 0; s < SIDES.length; s++) {
        const sideOrder = SIDES_ORDER[s];
        const rotation = SIDES_ROTATION[sideOrder];

        for (let i = 0; i <= layerStringCount; i++) {
          const sideProps = { layerStringCount, size, layerStart, angle };
          this.nails.addNail({
            point: this.getPoint({
              sideOrder,
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
