const PI2 = Math.PI * 2;

export default class Circle {
    constructor(config) {
        const { n, size, margin = 0, rotation = 0, center, radius, reverse = false } = this.config = config;
        
        this.center = center ?? size.map(v => v / 2);
        this.radius = radius ?? Math.min(...this.center) - margin;

        this.indexAngle = PI2 / n;
        this.rotationAngle = -PI2 * rotation;
        this.isReverse = reverse;
    }

    getPoint(index = 0) {
        const realIndex = this.isReverse ? this.config.n - 1 - index : index;

        return [
            this.center[0] + Math.sin(realIndex * this.indexAngle + this.rotationAngle) * this.radius,
            this.center[1] + Math.cos(realIndex * this.indexAngle + this.rotationAngle) * this.radius
        ];
    }

    drawNails(nails, {nailsNumberStart = 0, getNumber} = {}) {
        for (let i=0; i < this.config.n; i++) {
            nails.addNail({point: this.getPoint(i), number: getNumber ? getNumber(i) : i + 1 + nailsNumberStart});
        }
    }

    static rotationConfig = {
        key: 'rotation',
        label: 'Rotation',
        defaultValue: 0,
        type: "range",
        attr: {
            min: 0,
            max: 1 + 1/360,
            step: 1 / 360,
        },
        displayValue: (config, { key }) => `${Math.round(config[key] * 360)}°`
    };
}