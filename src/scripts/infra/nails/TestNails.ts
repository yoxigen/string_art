import { Coordinates } from '../../types/general.types';
import Nails from './Nails';
import NailsGroup from './NailsGroup';

export default class TestNails extends Nails {
  #nailCount = 0;

  get nailCount(): number {
    return this.#nailCount;
  }

  addNail(key: string | number, coordinates: Coordinates): void {
    this.#nailCount++;
  }

  addGroup(nailsGroup: NailsGroup): void {
    this.#nailCount += nailsGroup.length;
  }

  draw() {
    this.#nailCount = 0;
  }
}
