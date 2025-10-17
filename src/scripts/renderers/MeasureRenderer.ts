import { getDistanceBetweenCoordinates, PI2 } from '../helpers/math_utils';
import { Coordinates } from '../types/general.types';
import { Nail, NailsRenderOptions } from '../types/stringart.types';
import { TestRenderer } from './TestRenderer';

export class MeasureRenderer extends TestRenderer {
  #threadsLength = 0;
  #nailCount = 0;

  get threadsLength(): number {
    return this.#threadsLength;
  }

  get nailCount(): number {
    return this.#nailCount;
  }

  resetStrings(): void {
    this.#threadsLength = 0;
  }

  renderLine(from: Coordinates, to: Coordinates): void {
    this.#threadsLength += getDistanceBetweenCoordinates(from, to);
  }

  resetNails(): void {
    this.#nailCount = 0;
  }

  renderNails(nails: Nail[], { radius }: NailsRenderOptions) {
    this.#nailCount += nails.length;
    const nailCircumference = PI2 * radius * 2; // Assuming two rounds around each nail, to be on the safe side when measuring total thread length
    this.#threadsLength += nails.length * nailCircumference;
  }
}
