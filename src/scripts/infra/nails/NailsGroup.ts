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
    this.#nails.set(key, coordinates);
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
