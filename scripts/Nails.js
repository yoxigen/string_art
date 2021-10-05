const PI2 = Math.PI * 2;

export default class Nails {
    constructor(canvas, config) {
        this.context = canvas.getContext("2d");
        this.setConfig(config);
        this.nails = [];
    }

    setConfig({ nailRadius, darkMode}) {
        this.nailRadius = nailRadius;
        this.nailsColor = darkMode ? '#ffffff' : '#000000';
        this.context.globalCompositeOperation = "source-over";
        this.context.beginPath();
        this.nails = [];
    }

    // Adds a nail to be rendered. nail: { point, number }
    addNail(nail) {
        this.nails.push(nail);
    }

    fill() {
        this.context.beginPath();
        this.nails.forEach(({ point: [x, y] }) => {
            this.context.moveTo(x + this.nailRadius, y);
            this.context.arc(x, y, this.nailRadius, 0, PI2)
        });

        this.context.fillStyle = this.nailsColor;
        this.context.fill();

        this.nails = [];
    }
}