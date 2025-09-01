import { ColorValue } from '../helpers/color/color.types';
import EventBus from '../helpers/EventBus';
import type { Coordinates, Dimensions } from '../types/general.types';
import type { Nail, NailsRenderOptions } from '../types/stringart.types';

export type RendererResetOptions = Partial<{
  resetStrings: boolean;
  resetNails: boolean;
  resetSize: boolean;
}>;

export default abstract class Renderer extends EventBus<{
  devicePixelRatioChange: { devicePixelRatio: number };
  sizeChange: { size: Dimensions };
}> {
  parentElement: HTMLElement;
  color?: ColorValue;
  size: Dimensions;
  pixelRatio = 1;
  /**
   * The current dimensions of the renderer. Should be fixed for device pixel ratio, if used by the renderer!
   */
  protected currentSize: Dimensions | null;

  #removeDevicePixelListener: Function;
  #removeOnResizeListener: typeof ResizeObserver.prototype.disconnect;

  constructor(parentElement: HTMLElement) {
    super();

    this.parentElement = parentElement;
    this.#setOnResize();
  }

  #setOnResize() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.setSize([entry.contentRect.width, entry.contentRect.height]);
      }
    });
    this.#removeOnResizeListener = () => resizeObserver.disconnect();
    resizeObserver.observe(this.parentElement);
  }

  destroy(): void {
    this.parentElement.innerHTML = '';
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
  abstract resetSize(): Dimensions;
  abstract setLineWidth(width: number): void;
  abstract renderLines(
    startPosition: Coordinates,
    ...positions: Array<Coordinates>
  ): void;
  abstract renderNails(
    nails: ReadonlyArray<Nail>,
    options: NailsRenderOptions
  ): void;
  abstract clear(): void;
  abstract toDataURL(): string;
  abstract setSize(size?: Dimensions | null): Dimensions;
  abstract setBackground(color: ColorValue): void;

  getSize(): Dimensions {
    const { width, height } = this.parentElement.getBoundingClientRect();
    return [width, height];
  }

  enablePixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    this.pixelRatio = dpr;

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

  disablePixelRatio() {
    this.pixelRatio = 1;
    this.#removeDevicePixelListener?.();
  }
}
