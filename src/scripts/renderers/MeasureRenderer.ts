import { ColorValue } from '../helpers/color/color.types';
import {
  getClosestDistance,
  getDistanceBetweenCoordinates,
  PI2,
} from '../helpers/math_utils';
import { Coordinates, Dimensions } from '../types/general.types';
import { PatternInfo } from '../types/info.types';
import { Nail, NailsRenderOptions } from '../types/stringart.types';
import { TestRenderer } from './TestRenderer';

export type ThreadsLength = {
  total: number;
  perColor: ReadonlyArray<{ color: ColorValue; length: number }>;
};

const DEFAULT_NAIL_RADIUS = 1.5;

export class MeasureRenderer extends TestRenderer {
  #threadsLength = 0;
  #nailCount = 0;
  #lastPoint: Coordinates;
  #currentColor: ColorValue;
  #threadsLengthPerColor: Map<ColorValue, number>;
  #nailCoords: Coordinates[];
  #nailThreadLength: number;

  constructor(size: Dimensions) {
    super(size);
    this.#threadsLengthPerColor = new Map();
    this.#nailCoords = [];
    this.#nailThreadLength = this.#getNailThreadLength(DEFAULT_NAIL_RADIUS);
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
    this.#threadsLengthPerColor = new Map();
  }

  renderLine(from: Coordinates, to: Coordinates): void {
    const lineLength =
      getDistanceBetweenCoordinates(from, to) + this.#nailThreadLength;
    this.#threadsLength += lineLength;
    this.#threadsLengthPerColor.set(
      this.#currentColor,
      this.#threadsLengthPerColor.get(this.#currentColor) + lineLength
    );
    this.#lastPoint = to;
  }

  resetNails(): void {
    this.#nailCount = 0;
    this.#nailCoords = [];
  }

  renderNails(nails: Nail[], { radius }: NailsRenderOptions) {
    this.#nailCount += nails.length;
    this.#nailThreadLength = this.#getNailThreadLength(radius);

    this.#nailCoords = this.#nailCoords.concat(nails.map(({ point }) => point));
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
      closestDistanceBetweenNails: getClosestDistance(this.#nailCoords),
    };
  }

  #getNailThreadLength(nailRadius: number): number {
    // Assuming two rounds around each nail, to be on the safe side when measuring total thread length
    return PI2 * nailRadius * 2;
  }
}
