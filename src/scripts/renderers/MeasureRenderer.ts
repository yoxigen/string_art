import { ColorValue } from '../helpers/color/color.types';
import { getDistanceBetweenCoordinates, PI2 } from '../helpers/math_utils';
import { Coordinates, Dimensions } from '../types/general.types';
import { PatternInfo } from '../types/info.types';
import { Nail, NailsRenderOptions } from '../types/stringart.types';
import { TestRenderer } from './TestRenderer';

export type ThreadsLength = {
  total: number;
  perColor: ReadonlyArray<{ color: ColorValue; length: number }>;
};

export class MeasureRenderer extends TestRenderer {
  #threadsLength = 0;
  #nailCount = 0;
  #lastPoint: Coordinates;
  #currentColor: ColorValue;
  #threadsLengthPerColor: Map<ColorValue, number>;

  constructor(size: Dimensions) {
    super(size);
    this.#threadsLengthPerColor = new Map();
  }

  get threadsLength(): ThreadsLength {
    return {
      total: Math.round(this.#threadsLength),
      perColor: Array.from(this.#threadsLengthPerColor.entries()).map(
        ([color, length]) => ({ color, length })
      ),
    };
  }

  get nailCount(): number {
    return this.#nailCount;
  }

  resetStrings(): void {
    this.#threadsLength = 0;
  }

  renderLine(from: Coordinates, to: Coordinates): void {
    const lineLength = getDistanceBetweenCoordinates(from, to);
    this.#threadsLength += getDistanceBetweenCoordinates(from, to);
    this.#threadsLengthPerColor.set(
      this.#currentColor,
      this.#threadsLengthPerColor.get(this.#currentColor) + lineLength
    );
    this.#lastPoint = to;
  }

  resetNails(): void {
    this.#nailCount = 0;
  }

  renderNails(nails: Nail[], { radius }: NailsRenderOptions) {
    this.#nailCount += nails.length;
    const nailCircumference = PI2 * radius * 2; // Assuming two rounds around each nail, to be on the safe side when measuring total thread length
    this.#threadsLength += nails.length * nailCircumference;
  }

  setStartingPoint(coordinates: Coordinates): void {
    this.#lastPoint = coordinates;
  }

  setColor(color: ColorValue): void {
    this.#currentColor = color;
    if (!this.#threadsLengthPerColor.has(color)) {
      this.#threadsLengthPerColor.set(color, 0);
    }
  }

  lineTo(to: Coordinates): void {
    if (!this.#lastPoint) {
      throw new Error("no last string coordinates, can't lineTo");
    }

    this.renderLine(this.#lastPoint, to);
  }

  getInfo(): PatternInfo {
    return {
      nailsCount: this.#nailCount,
      threadsLength: this.threadsLength,
    };
  }
}
