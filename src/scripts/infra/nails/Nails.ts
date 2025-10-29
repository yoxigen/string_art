import { ColorValue } from '../../helpers/color/color.types';
import type Renderer from '../renderers/Renderer';
import { NailsConfig } from '../../types/config.types';
import { Nail, NailsRenderOptions } from '../../types/stringart.types';
import NailsGroup from './NailsGroup';

const precision = 1000;

export default class Nails {
  // addedPoints: Set<number>;
  // addedNumbers: Set<string | number>;

  #nailGroups: NailsGroup[] = [];

  constructor(public options: Partial<NailsRenderOptions>) {
    // this.addedPoints = new Set();
    // this.addedNumbers = new Set();
  }

  // setConfig({ nailRadius, nailsColor, nailNumbersFontSize }: NailsConfig) {
  //   this.nailRadius = nailRadius;
  //   this.nailsColor = nailsColor;
  //   this.nailNumbersFontSize = nailNumbersFontSize;
  //   if (this.addedPoints) {
  //     this.addedPoints.clear();
  //   }
  // }

  // #addNailToSets(nail: Nail) {
  //   if (this.addedNumbers.has(nail.number)) {
  //     throw new Error(`Nails already contains number ${nail.number}.`);
  //   } else {
  //     this.addedNumbers.add(nail.number);
  //   }

  //   const key =
  //     Math.round(nail.point[0] * precision) * 1e7 +
  //     Math.round(nail.point[1] * precision);
  //   if (!this.addedPoints.has(key)) {
  //     this.addedPoints.add(key);
  //     return true;
  //   }

  //   return false;
  // }

  addNail(nail: Nail) {
    // if (this.#addNailToSets(nail)) {
    //   this.nails.push(nail);
    // }
  }

  addGroup(nailsGroup: NailsGroup) {
    //nails.forEach(nail => this.#addNailToSets(nail));
    this.#nailGroups.push(nailsGroup);
  }

  // #render(
  //   renderer: Renderer,
  //   nails: ReadonlyArray<Nail>,
  //   options: NailsRenderOptions
  // ) {
  //   renderer.renderNails(nails, {
  //     ...DEFAULT_OPTIONS,
  //     ...options,
  //   });
  // }

  draw(renderer: Renderer) {
    // this.#render(renderer, this.nails, options);

    //this.nails = [];
    //this.addedPoints.clear();

    this.#nailGroups.forEach(group =>
      renderer.renderNailsGroup(group, {
        defaultOptions: this.options,
        renderNumbers: this.options.renderNumbers,
      })
    );

    //this.#nailGroups = [];
  }
}
