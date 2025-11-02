import { ColorValue } from '../../helpers/color/color.types';
import Renderer from './Renderer';
import {
  Coordinates,
  Dimensions,
  LineCoordinates,
} from '../../types/general.types';
import { NailsRenderOptions } from '../../types/stringart.types';

export class TestRenderer extends Renderer {
  strings: LineCoordinates[] = [];
  nails: Coordinates[] = [];
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

  renderLine(from: Coordinates, to: Coordinates) {
    this.strings.push([from, to]);
  }

  renderInstructions(from: Coordinates, to: Coordinates): void {}
  clearInstructions(): void {}
  lineTo(to: Coordinates) {
    this.strings.push([[0, 0], to]);
  }

  renderNails(nails: Iterable<Coordinates>, options: NailsRenderOptions) {
    for (let nail of nails) {
      this.nails.push(nail);
    }
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

  showInstructions(): void {}

  hideInstructions(): void {}
}
