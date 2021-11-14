import StringArt from "../StringArt.js";
import Circle from './Circle.js';

class Spirals extends StringArt{
    name = "Spirals";
    id = "spirals";
    link = "https://www.etsy.com/il-en/listing/974865185/3d-string-art-spiral-mandala-wall?ref=shop_home_active_10&frs=1";
    controls = [
        {
            key: 'radiusIncrease',
            label: 'Radius change',
            defaultValue: 3.2,
            type: "range",
            attr: {
                min: 1,
                max: 20,
                step: 0.1
            }
        },
        {
            key: 'angleStep',
            label: 'Angle step',
            defaultValue: 0.27,
            type: "range",
            attr: {
                min: 0,
                max: 1,
                step: 0.01,
            }
        },
        {
            key: 'nSpirals',
            label: 'Number of spirals',
            defaultValue: 3,
            type: "range",
            attr: {
                min: 1,
                max: 20,
                step: 1
            }
        },
        {
            ...Circle.rotationConfig,
            defaultValue: 330/360
        },
        {
            key: 'color',
            label: 'String color',
            defaultValue: "#00ddff",
            type: "color",
        }
    ];
    
    setUpDraw() {
        super.setUpDraw();

        const {nSpirals, rotation, margin, radiusIncrease, angleStep} = this.config;
        const PI2 = Math.PI * 2;

        this.spiralRotations = new Array(nSpirals).fill(null).map((_, i) => i * PI2 / nSpirals);
        this.rotationAngle = -PI2 * rotation;
        const maxRadius = Math.min(...this.size) / 2 - margin;
        this.nailsPerSpiral = Math.floor(maxRadius / radiusIncrease);
        this.angleIncrease = angleStep / (maxRadius / 50);
    }

    *generatePoints() {
        const {
            nSpirals
        } = this.config;
      
        for (let i = 0; i < this.nailsPerSpiral; i++) {
            for (let s = 0; s < nSpirals; s++) {
                const point = this.getPoint(s, i);
                yield {point, nailNumber: `${s}_${i}`};
            }
        }
    }

    getPoint(spiralIndex, index) {
        const [centerx, centery] = this.center;
        const {radiusIncrease} = this.config;

        const angle = this.rotationAngle + this.angleIncrease * index + this.spiralRotations[spiralIndex];
        const radius = index * radiusIncrease;

        return [
            centerx + radius * Math.sin(angle),
            centery + radius * Math.cos(angle)
        ];
    }

    *generateStrings() {
        const points = this.generatePoints();
        let index = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(...this.center);
        this.ctx.strokeStyle = this.config.color;

        let lastPoint;

        for (const {point} of points) {
            this.ctx.beginPath();
            if (lastPoint) {
                this.ctx.moveTo(...lastPoint);
                this.ctx.lineTo(...point);
            }
            lastPoint = point;
            this.ctx.stroke();
            yield index++;
        }
    }

    getStepCount() {
        const { nSpirals, radiusIncrease } = this.config;
        const maxRadius = Math.min(...this.getSize());
        const n = Math.floor(maxRadius / radiusIncrease);
        return n * nSpirals;
    }

    drawNails() {
        const points = this.generatePoints();
        for (const {point, nailNumber} of points) {
            this.nails.addNail({point, number: nailNumber});
        }
    }
}

export default Spirals;