import StringArt from "../StringArt.js";

const MARGIN = 20;
const PI2 = Math.PI * 2;

export default class CircleBase extends StringArt {
    setUpDraw() {
        super.setUpDraw();
        this.center = this.size.map(v => v / 2);
        this.radius = Math.min(...this.center) - MARGIN;

        const {n, rotation = 0} = this.config;
        this.indexAngle = PI2 / n;
        this.rotationAngle = PI2 * rotation;
    }

    getCirclePoint(index = 0) {
        return [
            this.center[0] + Math.sin(index * this.indexAngle + this.rotationAngle) * this.radius,
            this.center[1] + Math.cos(index * this.indexAngle + this.rotationAngle) * this.radius
        ];
    }

    drawNails() {
        const {n} = this.config;
        for (let i=0; i < n; i++) {
            this.nails.addNail({point: this.getCirclePoint(i)});
        }
    }
}