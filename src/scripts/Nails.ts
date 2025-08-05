import type Renderer from './renderers/Renderer';
import { NailsConfig } from './types/config.types';
import { ColorValue } from './types/general.types';
import { Nail, NailsRenderOptions } from './types/stringart.types';

const NUMBER_MARGIN = 4;

const DEFAULT_CONFIG: NailsRenderOptions = {
  color: '#ffffff',
  fontSize: 10,
  radius: 1.5,
  renderNumbers: false,
  margin: NUMBER_MARGIN,
};

export default class Nails {
  nailRadius: number;
  nailsColor: ColorValue;
  nailNumbersFontSize: number;
  nails: Array<Nail>;
  addedPoints: Set<string>;
  renderer: Renderer;

  #nailGroups = [];

  constructor(renderer: Renderer, config: NailsConfig) {
    this.setConfig(config);
    this.nails = [];
    this.addedPoints = new Set();
    this.renderer = renderer;
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

  // Adds a nail to be rendered. nail: { point, number }
  addNail(nail: Nail) {
    const nailPoint = nail.point.map(Math.round).join('_');
    if (!this.addedPoints.has(nailPoint)) {
      this.nails.push(nail);
      this.addedPoints.add(nailPoint);
    }
  }

  addGroup(nails: ReadonlyArray<Nail>, config: Partial<NailsConfig>) {
    this.#nailGroups.push({ nails, config });
  }

  #render(nails: ReadonlyArray<Nail>, _config: NailsRenderOptions) {
    const config = {
      ...DEFAULT_CONFIG,
      ..._config,
    };

    this.renderer.renderNails(nails, config);
  }

  fill({ drawNumbers = true } = {}) {
    const config: NailsRenderOptions = {
      color: this.nailsColor,
      fontSize: this.nailNumbersFontSize,
      radius: this.nailRadius,
      renderNumbers: drawNumbers,
    };

    this.#render(this.nails, config);

    this.nails = [];
    this.addedPoints.clear();

    this.#nailGroups.forEach(({ nails: groupNails, config: groupConfig }) => {
      this.#render(groupNails, {
        ...config,
        ...groupConfig,
      });
    });

    this.#nailGroups = [];
  }
}
