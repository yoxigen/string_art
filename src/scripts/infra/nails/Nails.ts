import type Renderer from '../renderers/Renderer';
import {
  NailGroupKey,
  NailKey,
  NailsRenderOptions,
} from '../../types/stringart.types';
import NailsGroup from './NailsGroup';
import { Coordinates } from '../../types/general.types';
import INails from './INails';

export default class Nails implements INails {
  #groups: Map<NailGroupKey, NailsGroup>;
  #defaultNailsGroup: NailsGroup;

  constructor() {
    this.#defaultNailsGroup = new NailsGroup();
    this.#groups = new Map([[null, this.#defaultNailsGroup]]);
  }

  addNail(key: NailKey, coordinates: Coordinates) {
    this.#defaultNailsGroup.addNail(key, coordinates);
  }

  addGroup(nailsGroup: NailsGroup, key: NailGroupKey): void {
    if (this.#groups.has(key)) {
      throw new Error(`Nails already has a group with key [${key}]`);
    }
    this.#groups.set(key, nailsGroup);
  }

  getNailCoordinates(
    nailKey: NailKey,
    groupKey: NailGroupKey = null
  ): Coordinates {
    const coordinates = this.#groups.get(groupKey)?.getNailCoordinates(nailKey);
    if (!coordinates) {
      throw new Error(`Key [${nailKey}] not found in group [${groupKey}].`);
    }
    return coordinates;
  }

  draw(
    renderer: Renderer,
    { precision, ...options }: { precision?: number } & NailsRenderOptions
  ) {
    let numbersStart = 1;
    this.#groups.values().forEach(group => {
      renderer.renderNails(
        precision || options.renderNumbers
          ? group.getUniqueNails(precision)
          : group.coordinates,
        {
          ...options,
          ...group.options,
          numbersStart,
        }
      );

      numbersStart += group.length;
    });
  }
}
