import Nails from './Nails';
import { Nail, NailsRenderOptions } from './types/stringart.types';

export default class TestNails extends Nails {
  #nailCount = 0;

  get nailCount(): number {
    return this.#nailCount;
  }

  constructor() {
    super({
      nails: 'minimized',
      nailRadius: 1,
      nailsColor: '#fff',
      nailNumbersFontSize: 10,
      showNails: true,
      showNailNumbers: false,
      margin: 0,
    });
  }

  addNail(nail: Nail): void {
    this.#nailCount++;
  }

  addGroup(
    nails: ReadonlyArray<Nail>,
    options: Partial<NailsRenderOptions>
  ): void {
    this.#nailCount += nails.length;
  }

  draw() {
    this.#nailCount = 0;
  }
}
