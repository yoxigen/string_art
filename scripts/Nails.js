const PI2 = Math.PI * 2;

export default class Nails {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.setConfig(config);
        this.nails = [];
    }

    setConfig({ nailRadius, darkMode}) {
        this.nailRadius = nailRadius;
        this.nailsColor = darkMode ? '#ffffff' : '#000000';
        this.context = this.canvas.getContext("2d");
        this.context.globalCompositeOperation = "source-over";
        this.context.beginPath();
        this.nails = [];
    }

    addNail(point) {
        this.nails.push(point)
    }

    fill() {
        this.context.beginPath();
        this.nails.forEach(([x, y]) => {
            this.context.moveTo(x + this.nailRadius, y);
            this.context.arc(x, y, this.nailRadius, 0, PI2)
        });

        this.context.fillStyle = this.nailsColor;
        this.context.fill();

        this.nails = [];
    }
}