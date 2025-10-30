import { Coordinates } from '../../types/general.types';
import { Nail, NailsRenderOptions } from '../../types/stringart.types';

export default class NailsGroup {
  #nails: Map<string | number, Coordinates>;
  #coordinatesHash: Set<string>;

  constructor(public options?: Partial<NailsRenderOptions>) {
    this.#nails = new Map();
    this.#coordinatesHash = new Set();
  }

  get length(): number {
    return this.#nails.size;
  }

  get coordinates(): MapIterator<Coordinates> {
    return this.#nails.values();
  }

  addNail(number: string | number, coordinates: Coordinates) {
    const hash = `${Math.round(coordinates[0] * 1000)}_${Math.round(
      coordinates[1] * 1000
    )}`;

    if (!this.#coordinatesHash.has(hash)) {
      this.#nails.set(number, coordinates);
      this.#coordinatesHash.add(hash);
    }
  }

  forEach(
    callback: (coordinates: Coordinates, number: string | number) => void
  ): void {
    this.#nails.forEach((coordinates, number) => callback(coordinates, number));
  }
}
