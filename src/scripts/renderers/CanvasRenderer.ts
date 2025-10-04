import Renderer, { LayerOptions, RendererOptions } from './Renderer';
import { PI2 } from '../helpers/math_utils';
import type { Coordinates, Dimensions } from '../types/general.types';
import type { Nail } from '../types/stringart.types';
import { ColorValue } from '../helpers/color/color.types';
import { areDimensionsEqual } from '../helpers/size_utils';
import { hide, unHide } from '../helpers/dom_utils';

let lastId = 0;
const INSTRUCTIONS_NAIL_RADIUS = 4;

export default class CanvasRenderer extends Renderer {
  #background: ColorValue | null;
  #currentColor: ColorValue;

  #layers: Record<
    'strings' | 'nails' | 'instructions',
    { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }
  >;

  #instructions: HTMLDivElement;
  #cancelInstructionsHide: Function;

  constructor(parentElement: HTMLElement, options?: RendererOptions) {
    super(parentElement, options);

    const stringsCanvas = document.createElement('canvas');
    const nailsCanvas = document.createElement('canvas');
    const instructionsCanvas = document.createElement('canvas');

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
      instructions: {
        canvas: instructionsCanvas,
        ctx: instructionsCanvas.getContext('2d'),
      },
    };

    stringsCanvas.id = 'CanvasRenderer__strings';
    nailsCanvas.id = 'CanvasRenderer__nails';
    instructionsCanvas.id = 'CanvasRenderer_instructions';

    this.instructionsCtx.lineWidth = 4;
    this.instructionsCtx.strokeStyle = 'Red';

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
    return [
      this.#layers.strings.canvas,
      this.#layers.nails.canvas,
      this.#layers.instructions.canvas,
    ];
  }

  get ctxs(): CanvasRenderingContext2D[] {
    return [
      this.#layers.strings.ctx,
      this.#layers.nails.ctx,
      this.#layers.instructions.ctx,
    ];
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

  get instructionsCanvas(): HTMLCanvasElement {
    return this.#layers.instructions.canvas;
  }

  get instructionsCtx(): CanvasRenderingContext2D {
    return this.#layers.instructions.ctx;
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
    const scale = 2.6;
    this.ctxs.forEach(ctx => ctx.setTransform(1, 0, 0, 1, 0, 0));
    this.ctxs.forEach(ctx => ctx.scale(scale, scale));
    this.ctxs.forEach(ctx =>
      ctx.translate(this.getSize()[0] * -0.625, this.getSize()[1] * -0.625)
    );
  }

  /**
   * Clears the stringsCanvas and resets the width and height
   */
  resetNails() {
    this.#layers.nails.ctx.clearRect(0, 0, ...this.getSize());
  }

  setColor(color: ColorValue) {
    this.#currentColor = color;
    this.stringsCtx.strokeStyle = color;
  }

  setLineWidth(width: number) {
    this.stringsCtx.lineWidth = width;
  }

  setBackground(color: ColorValue | null) {
    if ((this.#background = color)) {
      this.parentElement.style.background = color;
      if (this.#instructions) {
        this.#instructions.style.background = color;
      }
    } else {
      this.parentElement.style.removeProperty('background');
      if (this.#instructions) {
        this.#instructions.style.background = 'black';
      }
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

  renderLine(from: Coordinates, to: Coordinates) {
    this.lastStringCoordinates = from;
    this.lineTo(to);
  }

  lineTo(to: Coordinates) {
    if (!this.lastStringCoordinates) {
      throw new Error("no last string coordinates, can't lineTo");
    }

    this.stringsCtx.beginPath();
    this.stringsCtx.moveTo(...this.lastStringCoordinates);
    this.stringsCtx.lineTo(...to);
    this.stringsCtx.stroke();
    this.lastLine = [this.lastStringCoordinates, to];
    this.lastStringCoordinates = to;
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

  showInstructions(): void {
    this.#cancelInstructionsHide?.();

    if (!this.#instructions) {
      this.#instructions = document.createElement('div');
      this.#instructions.id = 'CanvasRenderer__instructions';

      const instructionsOverlay = document.createElement('div');
      instructionsOverlay.id = 'CanvasRenderer__instructions_overlay';
      instructionsOverlay.style = `background: ${
        this.parentElement.style.background ?? 'black'
      }; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.5`;
      this.#instructions.appendChild(instructionsOverlay);
      this.#instructions.appendChild(this.instructionsCanvas);
      this.parentElement.appendChild(this.#instructions);
    } else {
      unHide(this.#instructions);
    }
  }

  hideInstructions(): void {
    if (this.#instructions) {
      let opacity = 1;
      const fadeOut = () => {
        opacity -= 0.02;
        this.#instructions.style.opacity = String(opacity);
        if (opacity > 0) {
          const raf = requestAnimationFrame(fadeOut);
          this.#cancelInstructionsHide = () => {
            cancelAnimationFrame(raf);
            this.#instructions.style.removeProperty('opacity');
          };
        } else {
          hide(this.#instructions);
          this.clearInstructions();
          this.#instructions.style.removeProperty('opacity');
        }
      };

      fadeOut();
    }
  }

  renderInstructions(from: Coordinates, to: Coordinates) {
    this.showInstructions();

    const strokeColor = 'white';
    const fillColor = this.#currentColor ?? 'red';

    this.clearInstructions();
    this.instructionsCtx.clearRect(0, 0, ...this.getSize());
    this.instructionsCtx.beginPath();
    this.instructionsCtx.lineWidth = 3;

    let prevPosition = from;
    this.#drawArrow(prevPosition, to, { strokeColor, fillColor });
    prevPosition = to;

    this.instructionsCtx.stroke();

    this.instructionsCtx.beginPath();
    [from, to].forEach(([x, y]) => {
      this.instructionsCtx.moveTo(x + INSTRUCTIONS_NAIL_RADIUS, y);
      this.instructionsCtx.arc(x, y, INSTRUCTIONS_NAIL_RADIUS, 0, PI2);
    });
    this.instructionsCtx.strokeStyle = strokeColor;
    this.instructionsCtx.stroke();
    this.instructionsCtx.fillStyle = fillColor;
    this.instructionsCtx.fill();
    this.hasInstructions = true;
  }

  clearInstructions(): void {
    if (this.hasInstructions) {
      this.instructionsCtx.clearRect(0, 0, ...this.getSize());
      this.hasInstructions = false;
    }
  }

  #drawArrow(
    from: Coordinates,
    to: Coordinates,
    { strokeColor = 'white', fillColor = 'red' }
  ) {
    const arrowHeadSize = 15;

    const ctx = this.instructionsCtx;

    // Calculate angle of the line
    const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);

    ctx.save(); // Save the current canvas state
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor; // For filling the arrowhead

    // Draw the main line
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.stroke();

    const arrowPos = [
      from[0] + (to[0] - from[0]) / 2,
      from[1] + (to[1] - from[1]) / 2,
    ];

    // Draw the arrowhead
    ctx.beginPath();
    ctx.moveTo(arrowPos[0], arrowPos[1]);
    ctx.lineTo(
      arrowPos[0] - arrowHeadSize * Math.cos(angle - Math.PI / 6),
      arrowPos[1] - arrowHeadSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      arrowPos[0] - arrowHeadSize * Math.cos(angle + Math.PI / 6),
      arrowPos[1] - arrowHeadSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath(); // Connects the last point to the first, closing the triangle
    ctx.fill(); // Fills the arrowhead

    ctx.restore(); // Restore the canvas state
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
    this.canvases
      .filter(canvas => canvas !== this.instructionsCanvas)
      .forEach(c => ctx.drawImage(c, 0, 0));
    return compositeCanvas;
  }
}
