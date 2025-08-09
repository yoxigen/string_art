import { ColorValue } from '../helpers/color/color.types';
import type { Coordinates, Dimensions } from '../types/general.types';
import type { Nail, NailsRenderOptions } from '../types/stringart.types';

export default abstract class Renderer {
  parentElement: HTMLElement;
  color?: ColorValue;
  size: Dimensions;

  constructor(parentElement: HTMLElement) {
    this.parentElement = parentElement;
  }

  destroy() {
    this.element.remove();
  }

  get element(): Element {
    throw new Error('element getter not implemented!');
  }

  setColor(color: ColorValue) {
    this.color = color;
  }

  abstract reset(): void;
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

  setBackground(color: ColorValue) {}

  getSize(): Dimensions {
    const { width, height } = this.parentElement.getBoundingClientRect();
    return [width, height];
  }

  setSize(size: Dimensions | null) {
    this.element.removeAttribute('width');
    this.element.removeAttribute('height');

    if (this.element instanceof HTMLElement) {
      if (size) {
        this.element.style.width = `${size[0]}px`;
        this.element.style.height = `${size[1]}px`;
      } else {
        this.element.removeAttribute('style');
      }
    }
  }
}
