import { ColorValue } from '../helpers/color/color.types';
import { NailGroupKey, NailKey } from '../types/stringart.types';
import Nails from './nails/Nails';
import Renderer from './renderers/Renderer';

interface Nail {
  nailKey: NailKey;
  groupKey: NailGroupKey;
}

/**
 * Controller is a metaphor for a person who creates the string art. It has methods similar to actions the person makes.
 */
export default class Controller {
  #lastNail: Nail;
  #lastString: [Nail, Nail];

  constructor(protected renderer: Renderer, protected nails: Nails) {}

  startLayer({ name, color }: { name?: string; color?: ColorValue }) {
    if (color) {
      this.renderer.setColor(color);
    }
  }

  goto(nailKey: NailKey, groupKey?: NailGroupKey): void {
    const coordinates = this.nails.getNailCoordinates(nailKey, groupKey);
    this.renderer.setStartingPoint(coordinates);
    this.#lastNail = { nailKey, groupKey };
  }

  stringTo(nailKey: NailKey, groupKey?: NailGroupKey) {
    this.renderer.lineTo(this.nails.getNailCoordinates(nailKey, groupKey));
    const nail = { nailKey, groupKey };
    this.#lastString = [this.#lastNail, nail];
    this.#lastNail = nail;
  }

  getLastStringNailNumbers(): [number, number] {
    return this.#lastString?.map(({ nailKey, groupKey }) =>
      this.nails.getNailNumber(nailKey, groupKey)
    ) as [number, number];
  }
}
