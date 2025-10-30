import { Nail } from '../../types/stringart.types';
import Nails from './Nails';
import NailsGroup from './NailsGroup';

export default class TestNails extends Nails {
  #nailCount = 0;

  get nailCount(): number {
    return this.#nailCount;
  }

  constructor() {
    super({
      radius: 1,
      color: '#fff',
      fontSize: 10,
      renderNumbers: false,
    });
  }

  addNail(nail: Nail): void {
    this.#nailCount++;
  }

  addGroup(nailsGroup: NailsGroup): void {
    this.#nailCount += nailsGroup.length;
  }

  draw() {
    this.#nailCount = 0;
  }
}
