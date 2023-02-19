import Renderer from './Renderer.js';
import { PI2 } from '../helpers/math_utils.js';

export default class CanvasRenderer extends Renderer {
  constructor(parentElement) {
    super(parentElement);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const bsr =
      this.ctx.webkitBackingStorePixelRatio ||
      this.ctx.mozBackingStorePixelRatio ||
      this.ctx.msBackingStorePixelRatio ||
      this.ctx.oBackingStorePixelRatio ||
      this.ctx.backingStorePixelRatio ||
      1;
    this.pixelRatio = dpr / bsr;
    this.ctx.globalCompositeOperation = 'source-over';

    parentElement.appendChild(this.canvas);
  }

  get element() {
    return this.canvas;
  }

  reset() {
    this.ctx.clearRect(0, 0, ...this.getSize());
    this.canvas.removeAttribute('width');
    this.canvas.removeAttribute('height');

    const [width, height] = this.getSize();
    this.canvas.setAttribute('width', width);
    this.canvas.setAttribute('height', height);
  }

  setColor(color) {
    this.ctx.strokeStyle = color;
  }

  setLineWidth(width) {
    this.ctx.lineWidth = width;
  }

  setBackground(color) {
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, ...this.getSize());
    this.ctx.globalCompositeOperation = 'source-over';
  }

  getSize() {
    return [
      this.canvas.clientWidth * this.pixelRatio,
      this.canvas.clientHeight * this.pixelRatio,
    ];
  }

  renderLines(startPosition, ...positions) {
    this.ctx.beginPath();
    this.ctx.moveTo(...startPosition);

    for (const position of positions) {
      this.ctx.lineTo(...position);
    }

    this.ctx.stroke();
  }

  renderNails(nails, { color, fontSize, radius, renderNumbers, margin = 0 }) {
    const centerX = this.canvas.width / 2;

    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = 'middle';
    this.ctx.font = `${fontSize}px sans-serif`;
    const nailNumberOffset = radius + margin;

    nails.forEach(({ point: [x, y], number }) => {
      this.ctx.moveTo(x + radius, y);
      this.ctx.arc(x, y, radius, 0, PI2);
      if (renderNumbers && number != null) {
        const isRightAlign = x < centerX;

        const numberPosition = [
          isRightAlign ? x - nailNumberOffset : x + nailNumberOffset,
          y,
        ];

        this.ctx.textAlign = isRightAlign ? 'right' : 'left';
        this.ctx.fillText(String(number), ...numberPosition);
      }
    });

    this.ctx.fill();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  toDataURL() {
    return this.canvas.toDataURL();
  }
}
