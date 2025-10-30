import { Coordinates } from '../../types/general.types';
import { NailsRenderOptions } from '../../types/stringart.types';

export default class NailsGroup {
  #xCoordinates: Float16Array;
  #yCoordinates: Float16Array;
  #numbers: Array<string | number>;

  #nails: Map<string | number, Coordinates> = new Map();

  constructor(public options?: Partial<NailsRenderOptions>) {
    // this.#xCoordinates = new Float16Array(length);
    // this.#yCoordinates = new Float16Array(length);
    this.#numbers = new Array(length);
  }

  get length(): number {
    return this.#nails.size;
  }

  get coordinates(): MapIterator<Coordinates> {
    return this.#nails.values();
  }

  // setNail(index: number, x: number, y: number, number: string | number) {
  //   this.#xCoordinates[index] = x;
  //   this.#yCoordinates[index] = y;
  //   this.#numbers[index] = number;
  // }

  addNail(number: string | number, coordinates: Coordinates) {
    this.#nails.set(number, coordinates);
  }

  forEach(
    callback: (coordinates: Coordinates, number: string | number) => void
  ): void {
    this.#nails.forEach((coordinates, number) => callback(coordinates, number));
  }
}
