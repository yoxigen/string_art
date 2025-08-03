const NUMBER_MARGIN = 4;

const DEFAULT_CONFIG = {
  color: '#ffffff',
  fontSize: 10,
  radius: 1.5,
  renderNumbers: false,
  margin: NUMBER_MARGIN,
};

export default class Nails {
  #nailGroups = [];

  constructor(renderer, config) {
    this.setConfig(config);
    this.nails = [];
    this.addedPoints = new Set();
    this.renderer = renderer;
  }

  setConfig({ nailRadius, nailsColor, nailNumbersFontSize }) {
    this.nailRadius = nailRadius;
    this.nailsColor = nailsColor;
    this.nailNumbersFontSize = nailNumbersFontSize;
    this.nails = [];
    if (this.addedPoints) {
      this.addedPoints.clear();
    }
  }

  // Adds a nail to be rendered. nail: { point, number }
  addNail(nail) {
    const nailPoint = nail.point.map(Math.round).join('_');
    if (!this.addedPoints.has(nailPoint)) {
      this.nails.push(nail);
      this.addedPoints.add(nailPoint);
    }
  }

  addGroup(nails, config) {
    this.#nailGroups.push({ nails, config });
  }

  #render(nails, _config) {
    const config = {
      ...DEFAULT_CONFIG,
      ..._config,
    };

    this.renderer.renderNails(nails, config);
  }

  fill({ drawNumbers = true } = {}) {
    const config = {
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
