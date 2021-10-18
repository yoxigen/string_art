import StringArt from "../StringArt.js";

class Spirals extends StringArt{
    name = "Spirals";
    id = "spirals";
    link = "https://www.etsy.com/il-en/listing/974865185/3d-string-art-spiral-mandala-wall?ref=shop_home_active_10&frs=1";
    controls = [
        {
            key: 'n',
            label: 'Number of nails',
            defaultValue: 92,
            type: "range",
            attr: {
                min: 3,
                max: 200,
                step: 1
            }
        },
        {
            key: 'radiusIncrease',
            label: 'Size',
            defaultValue: 3,
            type: "range",
            attr: {
                min: 1,
                max: 20,
                step: 0.2
            }
        },
        {
            key: 'angleStep',
            label: 'Angle step',
            defaultValue: 0.05,
            type: "range",
            attr: {
                min: 0.01,
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
            key: 'color',
            label: 'String color',
            defaultValue: "#00ddff",
            type: "color",
        }
    ];
    
    *generatePoints() {
        const {
            n, radiusIncrease, angleStep, nSpirals,
        } = this.config;
        
        let currentRadius = 0;
        let angle = 0;
        const [centerx, centery] = this.center;

        for (let i = 0; i < n; i++) {
            for (let s = 0; s < nSpirals; s++) {
                const rotation = s * 2 * Math.PI / nSpirals;
                const point = [
                    centerx + currentRadius * Math.sin(angle + rotation),
                    centery + currentRadius * Math.cos(angle + rotation)
                ];
                yield point;
            }
            
            angle += angleStep;
            currentRadius += radiusIncrease;
        }
    }

    *generateStrings() {
        const points = this.generatePoints();
        let index = 0;
        this.ctx.beginPath();
        this.ctx.moveTo(...this.center);
        this.ctx.strokeStyle = this.config.color;

        let lastPoint = this.center;

        for (const point of points) {
            this.ctx.beginPath();
            this.ctx.moveTo(...lastPoint);
            lastPoint = point;
            this.ctx.lineTo(...point);
            this.ctx.strokeStyle = this.config.color;
            this.ctx.stroke();
            yield index++;
        }
    }

    getStepCount() {
        const { n, nSpirals } = this.config;
        return n * nSpirals;
    }

    drawNails() {
        const points = this.generatePoints();
        let index = 0;
        for (const point of points) {
            this.nails.addNail({point, number: `${index++}`});
        }
    }
}

export default Spirals;