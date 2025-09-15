import { ColorValue } from '../helpers/color/color.types';
import Renderer, { RendererOptions } from '../renderers/Renderer';
import { Coordinates, Dimensions } from '../types/general.types';
import { Nail, NailsRenderOptions } from '../types/stringart.types';

export class TestRenderer extends Renderer {
  strings = [];
  nails = [];
  lineWidth = 1;
  size: Dimensions = [0, 0];
  background: ColorValue;

  constructor(size: Dimensions) {
    super(null, { updateOnResize: false });
    this.size = size;
  }

  resetStrings(): void {
    this.strings.length = 0;
  }
  resetNails() {
    this.nails.length = 0;
  }

  setLineWidth(width: number) {
    this.lineWidth = width;
  }

  renderLines(startPosition: Coordinates, ...positions: Array<Coordinates>) {
    this.strings.push({ startPosition, positions });
  }

  renderNails(nails: ReadonlyArray<Nail>, options: NailsRenderOptions) {
    this.nails.push(...nails);
  }

  clear() {
    this.resetStrings();
    this.resetNails();
  }

  toDataURL() {
    return '';
  }

  getSize(): Dimensions {
    return this.size;
  }
  setSize(size?: Dimensions | null): Dimensions {
    return (this.size = size);
  }

  setBackground(color: ColorValue): void {
    this.background = color;
  }
}
