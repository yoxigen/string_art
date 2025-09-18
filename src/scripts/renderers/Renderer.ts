import { ColorValue } from '../helpers/color/color.types';
import EventBus from '../helpers/EventBus';
import type { Coordinates, Dimensions } from '../types/general.types';
import type { Nail, NailsRenderOptions } from '../types/stringart.types';

export type RendererResetOptions = Partial<{
  resetStrings: boolean;
  resetNails: boolean;
  resetSize: boolean;
}>;

export type RendererOptions = Partial<{
  updateOnResize: boolean;
  showInstructions: boolean;
}>;

const DEFAULT_OPTIONS: RendererOptions = {
  updateOnResize: true,
  showInstructions: false,
};

export default abstract class Renderer extends EventBus<{
  devicePixelRatioChange: { devicePixelRatio: number };
  sizeChange: { size: Dimensions };
}> {
  parentElement: HTMLElement;
  color?: ColorValue;
  size: Dimensions;
  fixedSize: Dimensions | null;
  pixelRatio = 1;
  options: RendererOptions;

  #isResizeFirstTime = true;

  /**
   * The current dimensions of the renderer. Should be fixed for device pixel ratio, if used by the renderer!
   */
  protected currentSize: Dimensions | null;
  protected lastLine: [Coordinates, Coordinates];

  protected lastStringCoordinates: Coordinates;

  #removeDevicePixelListener: Function;
  #removeOnResizeListener: typeof ResizeObserver.prototype.disconnect;

  constructor(parentElement: HTMLElement, options?: RendererOptions) {
    super();
    this.options = options ?? DEFAULT_OPTIONS;

    const { updateOnResize = true } = this.options;

    this.parentElement = parentElement;
    if (updateOnResize) {
      this.#setOnResize();
    }
  }

  #setOnResize() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (!this.#isResizeFirstTime) {
          if (!this.fixedSize) {
            this.setSize([entry.contentRect.width, entry.contentRect.height]);
          }
        }
        this.#isResizeFirstTime = false;
      }
    });
    this.#removeOnResizeListener = () => resizeObserver.disconnect();
    resizeObserver.observe(this.parentElement);
  }

  destroy(): void {
    if (this.parentElement) {
      this.parentElement.innerHTML = '';
    }
    this.#removeDevicePixelListener?.();
    this.#removeOnResizeListener?.();
  }

  get element(): Element {
    throw new Error('element getter not implemented!');
  }

  setColor(color: ColorValue) {
    this.color = color;
  }

  abstract resetStrings(): void;
  abstract resetNails(): void;
  resetSize(): void {
    this.fixedSize = null;
  }

  abstract setLineWidth(width: number): void;
  abstract renderLine(from: Coordinates, to: Coordinates): void;
  abstract lineTo(to: Coordinates): void;
  abstract renderNails(
    nails: ReadonlyArray<Nail>,
    options: NailsRenderOptions
  ): void;
  abstract renderInstructions;
  abstract clear(): void;
  abstract toDataURL(): string;
  abstract setSize(size?: Dimensions | null): Dimensions;
  abstract setBackground(color: ColorValue): void;
  abstract showInstructions(): void;
  abstract hideInstructions(): void;

  getSize(): Dimensions {
    const { width, height } = this.parentElement.getBoundingClientRect();
    return [width, height];
  }

  /**
   * Returns the CSS pixel space dimensions of the renderer (as opposed to the device pixels, which uses device pixel ratio)
   * @returns
   */
  getLogicalSize(): Dimensions {
    return this.getSize();
  }

  /**
   * Sets a fixed size for the renderer, which doesn't get updates on resize changes
   * A fixed size can be cancelled with `resetSize` or setSize(null).
   */
  setFixedSize(size: Dimensions): void {
    // First setting to null because the `setSize` method won't override an existing fixedSize
    this.fixedSize = null;
    this.setSize(size);
    this.fixedSize = size;
  }

  enablePixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    this.pixelRatio = dpr;

    if (this.options.updateOnResize !== false) {
      const updatePixelRatio = () => {
        this.#removeDevicePixelListener?.();
        const mqString = `(resolution: ${dpr}dppx)`;
        const media = matchMedia(mqString);
        media.addEventListener('change', updatePixelRatio);
        this.#removeDevicePixelListener = () => {
          media.removeEventListener('change', updatePixelRatio);
        };

        this.pixelRatio = window.devicePixelRatio;
        this.emit('devicePixelRatioChange', {
          devicePixelRatio: this.pixelRatio,
        });
      };

      updatePixelRatio();
    }
  }

  disablePixelRatio() {
    this.pixelRatio = 1;
    this.#removeDevicePixelListener?.();
  }
}
