import { ColorValue } from '../helpers/color/color.types';
import type { Coordinates, Dimensions } from '../types/general.types';
import type { Nail, NailsRenderOptions } from '../types/stringart.types';

export type RendererResetOptions = Partial<{
  resetStrings: boolean;
  resetNails: boolean;
  resetSize: boolean;
}>;

export default abstract class Renderer {
  parentElement: HTMLElement;
  color?: ColorValue;
  size: Dimensions;
  pixelRatio = 1;

  constructor(parentElement: HTMLElement) {
    this.parentElement = parentElement;
  }

  destroy(): void {
    this.parentElement.innerHTML = '';
  }

  get element(): Element {
    throw new Error('element getter not implemented!');
  }

  setColor(color: ColorValue) {
    this.color = color;
  }

  abstract resetStrings(): void;
  abstract resetNails(): void;
  abstract resetSize(): void;
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
  abstract setSize(size: Dimensions | null): void;

  setBackground(color: ColorValue) {}

  getSize(): Dimensions {
    const { width, height } = this.parentElement.getBoundingClientRect();
    return [width, height];
  }

  enablePixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    this.pixelRatio = dpr;
  }

  disablePixelRatio() {
    this.pixelRatio = 1;
  }
}
