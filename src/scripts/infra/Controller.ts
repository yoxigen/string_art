import { Coordinates, LineCoordinates } from '../types/general.types';
import { NailKey, NailsRenderOptions } from '../types/stringart.types';
import Nails from './nails/Nails';
import NailsGroup from './nails/NailsGroup';
import Renderer from './renderers/Renderer';

export interface ControllerOptions {
  precision?: number;
  nailsOptions: NailsRenderOptions;
}

export default class Controller {
  #nailsMap: Map<NailKey, Coordinates>;
  #nailNumbers: Map<NailKey, number>;
  #nailsCount = 0;
  #lastNail: NailKey;
  #lastString: [NailKey, NailKey];

  constructor(private renderer: Renderer, private options: ControllerOptions) {
    this.#nailsMap = new Map();
  }

  setNails(nails: Nails) {
    nails.groups.forEach(group => this.addNailsGroup(group));
  }

  addNailsGroup(nailsGroup: NailsGroup) {
    nailsGroup.forEach((coordinates, key) => {
      this.#nailsMap.set(key, coordinates);
      this.#nailNumbers.set(key, this.#nailsCount++);
    });
  }

  getNailCoordinates(key: NailKey): Coordinates {
    const coordinates = this.#nailsMap.get(key);
    if (!coordinates) {
      throw new Error(`Unknown nail, [${key}].`);
    }
    return coordinates;
  }

  setStartingNail(key: NailKey): void {
    const coordinates = this.getNailCoordinates(key);
    this.renderer.setStartingPoint(coordinates);
    this.#lastNail = key;
  }

  stringTo(key: NailKey) {
    this.renderer.lineTo(this.getNailCoordinates(key));
    this.#lastString = [this.#lastNail, key];
    this.#lastNail = key;
  }

  drawString(from: NailKey, to: NailKey): void {
    this.renderer.renderLine(
      this.getNailCoordinates(from),
      this.getNailCoordinates(to)
    );
    this.#lastNail = to;
    this.#lastString = [from, to];
  }

  drawNails() {
    console.log('drawNails!');
    // const addedCoordinates = new Set<number>();
    // for (const entry of this.#nails.entries()) {
    //   const coordinates = entry[1];
    //   const hash =
    //     1e5 * Math.round(coordinates[0] * precision) +
    //     Math.round(coordinates[1] * precision);
    //   if (!addedCoordinates.has(hash)) {
    //     yield entry;
    //     addedCoordinates.add(hash);
    //   }
    // }

    // this.renderer.renderNails(getCoordinates(), {
    //   ...this.options.nailsOptions,
    //   ...nailsGroup.options,
    //   numbersStart: this.#nailsCount,
    // });
  }
  getLastStringNumbers(): [number, number] {
    return this.#lastString?.map(k => this.#nailNumbers.get(k)) as [
      number,
      number
    ];
  }
}
