import { Coordinates } from '../../types/general.types';
import { Nail, NailsRenderOptions } from '../../types/stringart.types';

export default class NailsGroup {
  #nails: Map<string | number, Coordinates>;

  constructor(public options?: Partial<NailsRenderOptions>) {
    this.#nails = new Map();
  }

  get length(): number {
    return this.#nails.size;
  }

  get coordinates(): MapIterator<Coordinates> {
    return this.#nails.values();
  }

  addNail(number: string | number, coordinates: Coordinates) {
    this.#nails.set(number, coordinates);
  }

  forEach(
    callback: (coordinates: Coordinates, number: string | number) => void
  ): void {
    this.#nails.forEach((coordinates, number) => callback(coordinates, number));
  }

  forEachUnique(
    callback: (coordinates: Coordinates, number: string | number) => void
  ): void {
    const coordinatesHash = new Set<string>();

    this.forEach((coordinates, number) => {
      const hash = `${Math.round(coordinates[0] * 1000)}_${Math.round(
        coordinates[1] * 1000
      )}`;
      if (!coordinatesHash.has(hash)) {
        callback(coordinates, number);
        coordinatesHash.add(hash);
      } else {
        console.log('HAS POINT ', { hash, number });
      }
    });
  }

  getUniqueCoordinatesCount(): number {
    let count = 0;
    this.forEachUnique(_ => count++);
    return count;
  }
}
