const PI2 = Math.PI * 2;

export default class Nails {
    constructor(canvasContext, { nailRadius, nailsColor}) {
        this.nailRadius = nailRadius;
        this.nailsColor = nailsColor;
        this.context = canvasContext;
        canvasContext.beginPath();
    }

    addNail([x,y]) {
        this.context.moveTo(x + this.nailRadius, y);
        this.context.arc(x, y, this.nailRadius, 0, PI2)
    }

    fill() {
        this.context.fillStyle = this.nailsColor;
        this.context.fill();
    }
}