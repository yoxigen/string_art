import { ColorValue } from '../../helpers/color/color.types';
import Renderer, { RendererOptions } from './Renderer';
import { Coordinates, Dimensions } from '../../types/general.types';
import { Nail, NailsRenderOptions } from '../../types/stringart.types';
import NailsGroup from '../nails/NailsGroup';

export class TestRenderer extends Renderer {
  strings = [];
  nails = [];
  nailGroups: NailsGroup[] = [];
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
    this.nailGroups.length = 0;
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

  renderNails(nails: ReadonlyArray<Nail>, options: NailsRenderOptions) {
    this.nails.push(...nails);
  }

  renderNailsGroup(nailsGroup: NailsGroup): void {
    this.nailGroups.push(nailsGroup);
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
