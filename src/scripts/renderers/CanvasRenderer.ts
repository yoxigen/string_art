import Renderer, { RendererResetOptions } from './Renderer';
import { PI2 } from '../helpers/math_utils';
import type { Coordinates, Dimensions } from '../types/general.types';
import type { Nail } from '../types/stringart.types';
import { ColorValue } from '../helpers/color/color.types';

export default class CanvasRenderer extends Renderer {
  #layers: Record<
    'strings' | 'nails',
    { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }
  >;

  constructor(parentElement: HTMLElement) {
    super(parentElement);

    const stringsCanvas = document.createElement('canvas');
    const nailsCanvas = document.createElement('canvas');

    this.#layers = {
      strings: {
        canvas: stringsCanvas,
        ctx: stringsCanvas.getContext('2d'),
      },
      nails: {
        canvas: nailsCanvas,
        ctx: nailsCanvas.getContext('2d'),
      },
    };

    stringsCanvas.id = 'CanvasRenderer__strings';
    nailsCanvas.id = 'CanvasRenderer__nails';

    this.canvases.forEach(canvas => {
      canvas.classList.add('CanvasRenderer__canvas');
      parentElement.appendChild(canvas);
    });
    this.enablePixelRatio();
    this.ctxs.forEach(ctx => (ctx.globalCompositeOperation = 'source-over'));
  }

  get element() {
    return this.#layers.strings.canvas;
  }

  get canvases(): HTMLCanvasElement[] {
    return [this.#layers.strings.canvas, this.#layers.nails.canvas];
  }

  get ctxs(): CanvasRenderingContext2D[] {
    return [this.#layers.strings.ctx, this.#layers.nails.ctx];
  }

  get stringsCtx(): CanvasRenderingContext2D {
    return this.#layers.strings.ctx;
  }

  get nailsCtx(): CanvasRenderingContext2D {
    return this.#layers.nails.ctx;
  }

  get stringsCanvas(): HTMLCanvasElement {
    return this.#layers.strings.canvas;
  }

  resetSize(): void {
    this.canvases.forEach(canvas => {
      canvas.removeAttribute('width');
      canvas.removeAttribute('height');
    });

    const [width, height] = this.getSize();
    this.canvases.forEach(canvas => {
      canvas.setAttribute('width', String(width));
      canvas.setAttribute('height', String(height));
    });
  }

  resetStrings(): void {
    this.stringsCtx.clearRect(0, 0, ...this.getSize());
  }

  /**
   * Clears the stringsCanvas and resets the width and height
   */
  resetNails() {
    this.#layers.nails.ctx.clearRect(0, 0, ...this.getSize());
  }

  setColor(color: ColorValue) {
    this.stringsCtx.strokeStyle = color;
  }

  setLineWidth(width: number) {
    this.stringsCtx.lineWidth = width;
  }

  setBackground(color: ColorValue) {
    this.stringsCtx.globalCompositeOperation = 'destination-over';
    this.stringsCtx.fillStyle = color;
    this.stringsCtx.fillRect(0, 0, ...this.getSize());
    this.stringsCtx.globalCompositeOperation = 'source-over';
  }

  getSize(): Dimensions {
    return [
      this.stringsCanvas.clientWidth * this.pixelRatio,
      this.stringsCanvas.clientHeight * this.pixelRatio,
    ];
  }

  renderLines(startPosition: Coordinates, ...positions: Array<Coordinates>) {
    this.stringsCtx.beginPath();
    this.stringsCtx.moveTo(...startPosition);

    for (const position of positions) {
      this.stringsCtx.lineTo(...position);
    }

    this.stringsCtx.stroke();
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
    const centerX = this.stringsCanvas.width / 2;

    this.nailsCtx.globalCompositeOperation = 'source-over';
    this.nailsCtx.beginPath();
    this.nailsCtx.fillStyle = color;
    this.nailsCtx.textBaseline = 'middle';
    this.nailsCtx.font = `${fontSize}px sans-serif`;
    const nailNumberOffset = radius + margin;

    nails.forEach(({ point: [x, y], number }) => {
      this.nailsCtx.moveTo(x + radius, y);
      this.nailsCtx.arc(x, y, radius, 0, PI2);
      if (renderNumbers && number != null) {
        const isRightAlign = x < centerX;

        const numberPosition: Coordinates = [
          isRightAlign ? x - nailNumberOffset : x + nailNumberOffset,
          y,
        ];

        this.nailsCtx.textAlign = isRightAlign ? 'right' : 'left';
        this.nailsCtx.fillText(String(number), ...numberPosition);
      }
    });

    this.nailsCtx.fill();
  }

  clear() {
    this.ctxs.forEach(ctx =>
      ctx.clearRect(0, 0, this.stringsCanvas.width, this.stringsCanvas.height)
    );
  }

  toDataURL(): string {
    return this.getComposite().toDataURL();
  }

  getComposite(): HTMLCanvasElement {
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = this.stringsCanvas.width;
    compositeCanvas.height = this.stringsCanvas.height;
    const ctx = compositeCanvas.getContext('2d');
    this.canvases.forEach(c => ctx.drawImage(c, 0, 0));
    return compositeCanvas;
  }
}
