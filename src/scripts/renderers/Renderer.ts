import type {
  ColorValue,
  Coordinates,
  Dimensions,
} from '../types/general.types';
import type { Nail, NailsRenderOptions } from '../types/stringart.types';

export default class Renderer {
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

  reset() {}

  setColor(color: ColorValue) {
    this.color = color;
  }

  setLineWidth(width: number) {}

  setBackground(color: ColorValue) {}

  renderLines(startPosition: Coordinates, ...positions: Array<Coordinates>) {
    throw new Error('Renderer "renderLines" method not implemented!');
  }

  /**
   * Renders the nails for the string art
   */
  renderNails(nails: ReadonlyArray<Nail>, options: NailsRenderOptions) {
    throw new Error('Renderer "renderNails" method not implemented!');
  }

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

  clear() {
    throw new Error('Renderer "clear" method not implemented!');
  }

  toDataURL() {
    throw new Error('Renderer "toDataURL" method not implemented!');
  }
}
