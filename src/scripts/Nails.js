const NUMBER_MARGIN = 4;

export default class Nails {
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

  fill({ drawNumbers = true } = {}) {
    this.renderer.renderNails(this.nails, {
      color: this.nailsColor,
      fontSize: this.nailNumbersFontSize,
      radius: this.nailRadius,
      renderNumbers: drawNumbers,
      margin: NUMBER_MARGIN,
    });

    this.nails = [];
    this.addedPoints.clear();
  }
}
