const PI2 = Math.PI * 2;

export default class Nails {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.setConfig(config);
    }

    setConfig({ nailRadius, nailsColor}) {
        this.nailRadius = nailRadius;
        this.nailsColor = nailsColor;
        this.context = this.canvas.getContext("2d");
        this.context.globalCompositeOperation = "source-over";
        this.context.beginPath();
    }
    resetConfig(config) {
        this.context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        this.setConfig(config);
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