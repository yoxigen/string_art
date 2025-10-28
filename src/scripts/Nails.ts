import { ColorValue } from './helpers/color/color.types';
import type Renderer from './renderers/Renderer';
import { NailsConfig } from './types/config.types';
import { Nail, NailsRenderOptions } from './types/stringart.types';

type NailsGroup = {
  nails: ReadonlyArray<Nail>;
  options: Partial<NailsRenderOptions>;
};
const NUMBER_MARGIN = 4;

const DEFAULT_OPTIONS: NailsRenderOptions = {
  color: '#ffffff',
  fontSize: 10,
  radius: 1.5,
  renderNumbers: false,
  margin: NUMBER_MARGIN,
};

export default class Nails {
  nailRadius: number = DEFAULT_OPTIONS.radius;
  nailsColor: ColorValue = DEFAULT_OPTIONS.color;
  nailNumbersFontSize: number = DEFAULT_OPTIONS.fontSize;
  nails: Array<Nail>;
  addedPoints: Set<number>;
  addedNumbers: Set<string | number>;

  #nailGroups: NailsGroup[] = [];

  constructor(config: NailsConfig) {
    this.setConfig(config);
    this.nails = [];
    this.addedPoints = new Set();
    this.addedNumbers = new Set();
  }

  setConfig({ nailRadius, nailsColor, nailNumbersFontSize }: NailsConfig) {
    this.nailRadius = nailRadius;
    this.nailsColor = nailsColor;
    this.nailNumbersFontSize = nailNumbersFontSize;
    this.nails = [];
    if (this.addedPoints) {
      this.addedPoints.clear();
    }
  }

  #addNailToSets(nail: Nail) {
    // if (this.addedNumbers.has(nail.number)) {
    //   throw new Error(`Nails already contains number ${nail.number}.`);
    // } else {
    //   this.addedNumbers.add(nail.number);
    // }

    const key = nail.point[0] * 1e9 + nail.point[1];
    if (!this.addedPoints.has(key)) {
      this.addedPoints.add(key);
      return true;
    }

    return false;
  }

  addNail(nail: Nail) {
    if (this.#addNailToSets(nail)) {
      this.nails.push(nail);
    }
  }

  addGroup(nails: ReadonlyArray<Nail>, options: Partial<NailsRenderOptions>) {
    nails.forEach(nail => this.#addNailToSets(nail));
    this.#nailGroups.push({ nails, options });
  }

  #render(
    renderer: Renderer,
    nails: ReadonlyArray<Nail>,
    options: NailsRenderOptions
  ) {
    renderer.renderNails(nails, {
      ...DEFAULT_OPTIONS,
      ...options,
    });
  }

  draw(renderer: Renderer, { drawNumbers = true } = {}) {
    const options: NailsRenderOptions = {
      color: this.nailsColor,
      fontSize: this.nailNumbersFontSize,
      radius: this.nailRadius,
      renderNumbers: drawNumbers,
    };

    this.#render(renderer, this.nails, options);

    this.nails = [];
    this.addedPoints.clear();

    this.#nailGroups.forEach(({ nails: groupNails, options: groupConfig }) => {
      this.#render(renderer, groupNails, {
        ...options,
        ...groupConfig,
      });
    });

    this.#nailGroups = [];
  }
}
