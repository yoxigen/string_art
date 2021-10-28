const PI2 = Math.PI * 2;

export default class Circle {
    constructor(config) {
        const { n, size, margin = 0, rotation = 0, center } = this.config = config;
        
        this.center = center ?? size.map(v => v / 2);
        this.radius = Math.min(...this.center) - margin;

        this.indexAngle = PI2 / n;
        this.rotationAngle = -PI2 * rotation;
    }

    getPoint(index = 0) {
        return [
            this.center[0] + Math.sin(index * this.indexAngle + this.rotationAngle) * this.radius,
            this.center[1] + Math.cos(index * this.indexAngle + this.rotationAngle) * this.radius
        ];
    }

    drawNails(nails) {
        for (let i=0; i < this.config.n; i++) {
            nails.addNail({point: this.getPoint(i)});
        }
    }

    static rotationConfig = {
        key: 'rotation',
        label: 'Rotation',
        defaultValue: 0,
        type: "range",
        attr: {
            min: 0,
            max: 1,
            step: 0.01,
        },
        displayValue: ({rotation}) => `${Math.round(rotation * 360)}°`
    };
}