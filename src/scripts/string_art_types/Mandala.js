import Color from '../helpers/Color.js';
import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';

export default class TimesTables extends StringArt {
  name = 'Mandala';
  id = 'mandala';
  link =
    'https://www.youtube.com/watch?v=LWin7w9hF-E&ab_channel=Jorgedelatierra';
  controls = [
    {
      key: 'n',
      label: 'Number of nails',
      defaultValue: 180,
      type: 'range',
      attr: { min: 3, max: 240, step: 1 },
    },
    {
      key: 'base',
      label: 'Multiplication',
      defaultValue: 2,
      type: 'range',
      attr: { min: 2, max: 99, step: 1 },
    },
    {
      key: 'layers',
      label: 'Layers',
      defaultValue: 7,
      type: 'range',
      attr: { min: 1, max: 20, step: 1 },
    },
    Circle.rotationConfig,
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        multicolorRange: 180,
        multicolorStart: 256,
        color: '#ff4d00',
      },
      exclude: ['colorCount'],
    }),
  ];

  get n() {
    if (!this._n) {
      const { n, layers } = this.config;
      const extraNails = n % layers;
      this._n = n - extraNails; // The number of nails should be a multiple of the layers, so the strings are exactly on the nails.
    }

    return this._n;
  }

  setUpDraw() {
    this._n = null;
    super.setUpDraw();

    const { layers, rotation, margin } = this.config;
    const circleConfig = {
      size: this.size,
      n: this.n,
      margin,
      rotation,
    };

    if (this.circle) {
      this.circle.setConfig(circleConfig);
    } else {
      this.circle = new Circle(circleConfig);
    }

    this.color = new Color({
      ...this.config,
      colorCount: layers,
    });

    this.layerShift = Math.floor(this.n / layers);
  }

  *drawTimesTable({ shift = 0, color = '#f00', time }) {
    const { base } = this.config;
    const n = this.n;

    let point = this.circle.getPoint(shift);

    for (let i = 1; i <= n; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(...point);
      point = this.circle.getPoint(i + shift);
      this.ctx.lineTo(...point);
      const toIndex = (i * base) % n;
      this.ctx.lineTo(...this.circle.getPoint(toIndex + shift));
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      yield {
        instructions: `${i - 1} → ${i} → ${toIndex} → ${i}`,
        index: time * n + i,
      };
    }
  }

  *generateStrings() {
    const { layers } = this.config;

    for (let time = 0; time < layers; time++) {
      const color = this.color.getColor(time);
      yield* this.drawTimesTable({
        time,
        color,
        shift: this.layerShift * time,
      });
    }
  }

  drawNails() {
    this.circle.drawNails(this.nails);
  }

  getStepCount() {
    return this.config.layers * this.n;
  }

  static thumbnailConfig = {
    n: 70,
  };
}
