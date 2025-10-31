import type Renderer from '../renderers/Renderer';
import { NailsRenderOptions } from '../../types/stringart.types';
import NailsGroup from './NailsGroup';
import { Coordinates } from '../../types/general.types';
import INails from './INails';

export default class Nails implements INails {
  #nailGroups: NailsGroup[];
  #defaultNailsGroup: NailsGroup;

  constructor(public options: NailsRenderOptions) {
    this.#nailGroups = [new NailsGroup(options)];
    this.#defaultNailsGroup = this.#nailGroups[0];
  }

  addNail(key: string | number, coordinates: Coordinates) {
    this.#defaultNailsGroup.addNail(key, coordinates);
  }

  addGroup(nailsGroup: NailsGroup) {
    //nails.forEach(nail => this.#addNailToSets(nail));
    this.#nailGroups.push(nailsGroup);
  }

  draw(renderer: Renderer) {
    let numbersStart = 1;
    this.#nailGroups.forEach(group => {
      renderer.renderNails(group.coordinates, {
        ...this.options,
        ...group.options,
        numbersStart,
      });

      numbersStart += group.length;
    });
  }
}
