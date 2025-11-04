import { Coordinates } from '../../types/general.types';
import { NailKey, NailsRenderOptions } from '../../types/stringart.types';
import INails from './INails';

export default class NailsGroup implements INails {
  #nails: Map<NailKey, Coordinates>;

  constructor(public options?: Partial<NailsRenderOptions>) {
    this.#nails = new Map();
  }

  get length(): number {
    return this.#nails.size;
  }

  get coordinates(): Iterable<Coordinates> {
    return this.#nails.values();
  }

  addNail(key: NailKey, coordinates: Coordinates) {
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

  getNailCoordinates(key: NailKey): Coordinates {
    return this.#nails.get(key);
  }

  *getUniqueNails(precision = 1): Generator<Coordinates> {
    const addedCoordinates = new Set<number>();
    for (const coordinates of this.#nails.values()) {
      const hash =
        1e5 * Math.round(coordinates[0] * precision) +
        Math.round(coordinates[1] * precision);
      if (!addedCoordinates.has(hash)) {
        yield coordinates;
        addedCoordinates.add(hash);
      }
    }
  }

  forEach(callback: (coordinates: Coordinates, key: NailKey) => void): void {
    this.#nails.forEach((coordinates, number) => callback(coordinates, number));
  }
}
