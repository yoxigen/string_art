import type Renderer from '../renderers/Renderer';
import {
  NailGroupKey,
  NailKey,
  NailsRenderOptions,
} from '../../types/stringart.types';
import NailsGroup from './NailsGroup';
import { Coordinates } from '../../types/general.types';
import NailsSetter from './NailsSetter';

export default class Nails implements NailsSetter {
  #groups: Map<NailGroupKey, NailsGroup>;
  #defaultNailsGroup: NailsGroup;
  #nailNumbers: Map<NailGroupKey, Map<NailKey, number>>;
  precision: number;

  constructor({ precision }: { precision?: number } = {}) {
    this.#defaultNailsGroup = new NailsGroup();
    this.#groups = new Map([[null, this.#defaultNailsGroup]]);
    this.precision = precision;
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

  getGroup(groupKey: NailGroupKey): NailsGroup {
    if (!this.#groups.has(groupKey)) {
      throw new Error(`Nails group '${groupKey}' not found.`);
    }

    return this.#groups.get(groupKey);
  }

  #setNailNumbers() {
    this.#nailNumbers = new Map();
    let groupNumbersStart = 1;

    for (const [key, group] of this.#groups.entries()) {
      this.#nailNumbers.set(
        key,
        group.getNailNumbers({
          precision: this.precision,
          startNumber: groupNumbersStart,
        })
      );

      groupNumbersStart += group.length;
    }
  }

  getNailNumber(nailKey: NailKey, groupKey?: NailGroupKey): number {
    if (!this.#nailNumbers) {
      this.#setNailNumbers();
    }

    return this.#nailNumbers.get(groupKey ?? null).get(nailKey);
  }

  getNailCoordinates(
    nailKey: NailKey,
    groupKey: NailGroupKey = null
  ): Coordinates {
    const coordinates = this.#groups.get(groupKey)?.getNailCoordinates(nailKey);
    if (!coordinates) {
      throw new Error(
        `Key [${nailKey}] not found in ${
          groupKey == null ? 'default nails group' : `nails group [${groupKey}]`
        }.`
      );
    }
    return coordinates;
  }

  draw(renderer: Renderer, options: NailsRenderOptions) {
    let numbersStart = 1;
    for (const group of this.#groups.values()) {
      renderer.renderNails(
        this.precision || options.renderNumbers
          ? group.getUniqueNails(this.precision)
          : group.coordinates,
        {
          ...options,
          ...group.options,
          numbersStart,
        }
      );

      numbersStart += group.length;
    }
  }
}
