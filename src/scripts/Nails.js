const PI2 = Math.PI * 2;
const NUMBER_MARGIN = 4;

export default class Nails {
  constructor(canvas, config) {
    this.context = canvas.getContext('2d');
    this.setConfig(config);
    this.centerX = canvas.width / 2;
    this.nails = [];
    this.addedPoints = new Set();
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
    this.context.globalCompositeOperation = 'source-over';
    this.context.beginPath();
    this.context.fillStyle = this.nailsColor;
    this.context.textBaseline = 'middle';
    this.context.font = `${this.nailNumbersFontSize}px sans-serif`;
    const nailNumberOffset = this.nailRadius + NUMBER_MARGIN;

    this.nails.forEach(({ point: [x, y], number }) => {
      this.context.moveTo(x + this.nailRadius, y);
      this.context.arc(x, y, this.nailRadius, 0, PI2);
      if (drawNumbers && number !== undefined && number !== null) {
        const isRightAlign = x < this.centerX;

        const numberPosition = [
          isRightAlign ? x - nailNumberOffset : x + nailNumberOffset,
          y,
        ];

        this.context.textAlign = isRightAlign ? 'right' : 'left';
        this.context.fillText(String(number), ...numberPosition);
      }
    });

    this.context.fill();
    this.nails = [];
    this.addedPoints.clear();
  }
}
