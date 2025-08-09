import Renderer from './Renderer';
import { PI2 } from '../helpers/math_utils';
import type { Coordinates, Dimensions } from '../types/general.types';
import type { Nail } from '../types/stringart.types';
import { ColorValue } from '../helpers/color/color.types';

export default class CanvasRenderer extends Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pixelRatio: number;

  constructor(parentElement: HTMLElement) {
    super(parentElement);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    this.pixelRatio = dpr;
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
    this.canvas.setAttribute('width', String(width));
    this.canvas.setAttribute('height', String(height));
  }

  setColor(color: ColorValue) {
    this.ctx.strokeStyle = color;
  }

  setLineWidth(width: number) {
    this.ctx.lineWidth = width;
  }

  setBackground(color: ColorValue) {
    this.ctx.globalCompositeOperation = 'destination-over';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, ...this.getSize());
    this.ctx.globalCompositeOperation = 'source-over';
  }

  getSize(): Dimensions {
    return [
      this.canvas.clientWidth * this.pixelRatio,
      this.canvas.clientHeight * this.pixelRatio,
    ];
  }

  renderLines(startPosition: Coordinates, ...positions: Array<Coordinates>) {
    this.ctx.beginPath();
    this.ctx.moveTo(...startPosition);

    for (const position of positions) {
      this.ctx.lineTo(...position);
    }

    this.ctx.stroke();
  }

  renderNails(
    nails: ReadonlyArray<Nail>,
    {
      color,
      fontSize,
      radius,
      renderNumbers,
      margin = 0,
    }: {
      color: ColorValue;
      fontSize: number;
      radius: number;
      renderNumbers?: boolean;
      margin?: number;
    }
  ) {
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

        const numberPosition: Coordinates = [
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

  toDataURL(): string {
    return this.canvas.toDataURL();
  }
}
