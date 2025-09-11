import Renderer, { RendererOptions, RendererResetOptions } from './Renderer';
import { PI2 } from '../helpers/math_utils';
import type { Coordinates, Dimensions } from '../types/general.types';
import type { Nail } from '../types/stringart.types';
import { ColorValue } from '../helpers/color/color.types';
import { areDimensionsEqual } from '../helpers/size_utils';

let lastId = 0;

export default class CanvasRenderer extends Renderer {
  #background: ColorValue | null;

  #layers: Record<
    'strings' | 'nails',
    { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }
  >;

  constructor(parentElement: HTMLElement, options?: RendererOptions) {
    super(parentElement, options);

    const stringsCanvas = document.createElement('canvas');
    const nailsCanvas = document.createElement('canvas');
    stringsCanvas.setAttribute('data-id', String(lastId++));
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
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    });
    this.enablePixelRatio();
    this.ctxs.forEach(ctx => (ctx.globalCompositeOperation = 'source-over'));
    this.addEventListener('devicePixelRatioChange', () => {
      this.setSize([
        this.stringsCanvas.clientWidth,
        this.stringsCanvas.clientHeight,
      ]);
    });

    this.resetSize(false);
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

  resetSize(notifyOnChange = true): Dimensions {
    super.resetSize();

    this.canvases.forEach(canvas => {
      canvas.removeAttribute('width');
      canvas.removeAttribute('height');
      canvas.style.removeProperty('width');
      canvas.style.removeProperty('height');
    });

    const newSize = this.getSize();
    this.canvases.forEach(canvas => {
      canvas.setAttribute('width', String(newSize[0]));
      canvas.setAttribute('height', String(newSize[1]));
    });

    if (!this.currentSize || !areDimensionsEqual(newSize, this.currentSize)) {
      this.currentSize = newSize;
      if (notifyOnChange) {
        this.emit('sizeChange', { size: newSize });
      }
    }

    return newSize;
  }

  setSize(size?: Dimensions | null): Dimensions {
    if (!size) {
      return this.resetSize();
    }

    if (this.fixedSize) {
      console.warn(
        `Trying to set size for Renderer to [${size.join(
          ', '
        )}], but size is fixed to [${this.fixedSize.join(', ')}].`
      );
      return this.fixedSize;
    }

    const realSize = size.map(v => v * this.pixelRatio) as Dimensions;
    this.canvases.forEach(canvas => {
      canvas.setAttribute('width', String(realSize[0]));
      canvas.setAttribute('height', String(realSize[1]));
      canvas.style.setProperty('width', `${size[0]}px`);
      canvas.style.setProperty('height', `${size[1]}px`);
    });

    if (!this.currentSize || !areDimensionsEqual(realSize, this.currentSize)) {
      this.currentSize = realSize;

      this.emit('sizeChange', { size: realSize });
    }

    return realSize;
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

  setBackground(color: ColorValue | null) {
    if ((this.#background = color)) {
      this.parentElement.style.background = color;
    } else {
      this.parentElement.style.removeProperty('background');
    }
  }

  #setBackgroundOnCanvas(context: CanvasRenderingContext2D, color: ColorValue) {
    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = color;
    context.fillRect(0, 0, ...this.getSize());
    context.globalCompositeOperation = 'source-over';
  }

  getLogicalSize(): Dimensions {
    return (
      this.fixedSize ??
      ([
        this.stringsCanvas.clientWidth,
        this.stringsCanvas.clientHeight,
      ] as Dimensions)
    );
  }

  getSize(): Dimensions {
    return this.getLogicalSize().map(v => v * this.pixelRatio) as Dimensions;
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
    this.ctxs.forEach(ctx => ctx.clearRect(0, 0, ...this.getSize()));
  }

  toDataURL(): string {
    return this.getComposite().toDataURL();
  }

  async toBlob(
    type: 'jpeg' | 'png' | 'webp' = 'png',
    quality = 1
  ): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      this.getComposite().toBlob(
        blob => (blob ? resolve(blob) : reject()),
        `image/${type}`,
        Math.max(0, Math.min(quality, 1))
      );
    });
  }

  getComposite(): HTMLCanvasElement {
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = this.stringsCanvas.width;
    compositeCanvas.height = this.stringsCanvas.height;
    const ctx = compositeCanvas.getContext('2d');
    if (this.#background) {
      this.#setBackgroundOnCanvas(ctx, this.#background);
    }
    this.canvases.forEach(c => ctx.drawImage(c, 0, 0));
    return compositeCanvas;
  }
}
