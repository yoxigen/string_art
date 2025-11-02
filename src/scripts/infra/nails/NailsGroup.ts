import { Coordinates } from '../../types/general.types';
import { NailsRenderOptions } from '../../types/stringart.types';
import INails from './INails';

export default class NailsGroup implements INails {
  #nails: Map<string | number, Coordinates>;

  constructor(public options?: Partial<NailsRenderOptions>) {
    this.#nails = new Map();
  }

  get length(): number {
    return this.#nails.size;
  }

  get coordinates(): Iterable<Coordinates> {
    return this.#nails.values();
  }

  addNail(key: string | number, coordinates: Coordinates) {
    if (this.#nails.has(key)) {
      console.warn(
        `Attempting to add a nail to NailsGroup, with already existing key, [${key}].`
      );
    }
    this.#nails.set(key, coordinates);
  }

  addGroup(nailsGroup: NailsGroup): void {
    throw new Error('Adding sub groups not implemented yet.');
  }

  getNailCoordinates(key: string | number): Coordinates {
    return this.#nails.get(key);
  }

  *getUniqueCoordinates(precision = 1000): Generator<Coordinates> {
    const addedCoordinates = new Set<number>();
    for (const point of this.coordinates) {
      const hash =
        1e5 * Math.round(point[0] * precision) +
        Math.round(point[1] * precision);
      if (!addedCoordinates.has(hash)) {
        yield point;
        addedCoordinates.add(hash);
      }
    }
  }

  forEach(
    callback: (coordinates: Coordinates, number: string | number) => void
  ): void {
    this.#nails.forEach((coordinates, number) => callback(coordinates, number));
  }
}
