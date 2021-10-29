const PI2 = Math.PI * 2;
const NUMBER_MARGIN = 4;

export default class Nails {
    constructor(canvas, config) {
        this.context = canvas.getContext("2d");
        this.setConfig(config);
        this.centerX = canvas.clientWidth / 2;
        this.nails = [];
    }

    setConfig({ nailRadius, darkMode, nailNumbersFontSize}) {
        this.nailRadius = nailRadius;
        this.nailsColor = darkMode ? '#ffffff' : '#000000';
        this.nailNumbersFontSize = nailNumbersFontSize;
        this.nails = [];
    }

    // Adds a nail to be rendered. nail: { point, number }
    addNail(nail) {
        this.nails.push(nail);
    }

    fill({ drawNumbers = true} = {}) {
        this.context.globalCompositeOperation = "source-over";
        this.context.beginPath();
        this.context.fillStyle = this.nailsColor;
        this.context.textBaseline = "middle";
        this.context.font = `${this.nailNumbersFontSize}px sans-serif`;
        const nailNumberOffset = this.nailRadius + NUMBER_MARGIN;

        this.nails.forEach(({ point: [x, y], number }) => {
            this.context.moveTo(x + this.nailRadius, y);
            this.context.arc(x, y, this.nailRadius, 0, PI2)
            if (drawNumbers && number !== undefined && number !== null) {
                const isRightAlign = x < this.centerX;

                const numberPosition = [
                    isRightAlign ? x - nailNumberOffset : x + nailNumberOffset,
                    y
                ];

                this.context.textAlign = isRightAlign ? "right" : "left";
                this.context.fillText(String(number), ...numberPosition);
            }
        });

        this.context.fill();
        this.nails = [];
    }
}