import StringArt from "../StringArt.js";

class Spirals extends StringArt{
    constructor(canvas) {
        super({
            name: "Spirals",
            id: 'spirals',
            link: "https://www.etsy.com/il-en/listing/974865185/3d-string-art-spiral-mandala-wall?ref=shop_home_active_10&frs=1",
            configControls: [
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
            ],
            canvas
        })
    }
    
    render() {
        const {
            n, radiusIncrease, angleStep, nSpirals, color,
            showNails, showStrings, 
        } = this.config;
        
        if (showStrings) {
            this.ctx.moveTo(...this.center);
            this.ctx.beginPath();
        }

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

                if (showStrings) {
                    this.ctx.lineTo(...point);
                }

                if (showNails) {
                    this.nails.addNail({point, number: `${s-i}`});
                }
            }
            
            angle += angleStep;
            currentRadius += radiusIncrease;
        }
        
        if (showStrings) {
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        }

        if (showNails) {
            this.nails.fill();
        }
    }
}

export default Spirals;