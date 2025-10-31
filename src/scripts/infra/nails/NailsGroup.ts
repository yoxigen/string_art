import { Coordinates } from '../../types/general.types';
import { NailsRenderOptions } from '../../types/stringart.types';
import INails from './INails';

const PRECISION = 1000;

export default class NailsGroup implements INails {
  #nails: Map<string | number, Coordinates>;
  #coordinatesHash: Set<string>;

  constructor(public options?: Partial<NailsRenderOptions>) {
    this.#nails = new Map();
    this.#coordinatesHash = new Set();
  }

  get length(): number {
    return this.#nails.size;
  }

  get coordinates(): Iterable<Coordinates> {
    return this.#nails.values();
  }

  addNail(key: string | number, coordinates: Coordinates) {
    const hash = `${Math.round(coordinates[0] * PRECISION)}_${Math.round(
      coordinates[1] * PRECISION
    )}`;

    if (!this.#coordinatesHash.has(hash)) {
      this.#nails.set(key, coordinates);
      this.#coordinatesHash.add(hash);
    }
  }

  addGroup(nailsGroup: NailsGroup): void {
    throw new Error('Adding sub groups not implemented yet.');
  }

  forEach(
    callback: (coordinates: Coordinates, number: string | number) => void
  ): void {
    this.#nails.forEach((coordinates, number) => callback(coordinates, number));
  }
}
