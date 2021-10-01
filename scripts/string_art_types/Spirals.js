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

    setUpDraw() {
        super.setUpDraw();

        if (this.contextStrings) {
	        this.contextStrings.clearRect(0, 0, ...this.size);
        } else {
            this.contextStrings = this.canvas.getContext("2d");
        }
    }
    
    render({
        n, radiusIncrease, angleStep, nSpirals, color,
        showNails, showStrings, 
    }) {
        if (showStrings) {
            this.contextStrings.moveTo(...this.center);
            this.contextStrings.beginPath();
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
                    this.contextStrings.lineTo(...point);
                }

                if (showNails) {
                    this.nails.addNail(point);
                }
            }
            
            angle += angleStep;
            currentRadius += radiusIncrease;
        }
        
        if (showStrings) {
            this.contextStrings.strokeStyle = color;
            this.contextStrings.stroke();
        }

        if (showNails) {
            this.nails.fill();
        }
    }
}

export default Spirals;