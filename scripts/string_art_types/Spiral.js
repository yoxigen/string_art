import StringArt from "../StringArt.js";

const MARGIN = 20;

class Spiral extends StringArt{
    constructor(canvas) {
        super({
            name: "Spiral",
            id: 'spiral',
            link: "https://www.etsy.com/il-en/listing/840974781/boho-wall-decor-artwork-spiral-round?ref=internal_similar_listing_bot-1&frs=1",
            configControls: [
                {
                    key: 'n',
                    label: 'Number of nails',
                    defaultValue: 144,
                    type: "range",
                    attr: {
                        min: 3,
                        max: 200,
                        step: 1
                    }
                },
                {
                    key: 'repetition',
                    label: 'Repetition',
                    defaultValue: 5,
                    type: "range",
                    attr: {
                        min: 0,
                        max: 60,
                        step: 1
                    }
                },
                {
                    key: 'innerLength',
                    label: 'Spiral thickness',
                    defaultValue: 67,
                    type: "range",
                    attr: {
                        min: 1,
                        max: 144,
                        step: 1,
                    }
                },
                {
                    key: 'color1',
                    label: 'String #1 color',
                    defaultValue: "#ff4d00",
                    type: "color",
                },
                {
                    key: 'color2',
                    label: 'String #2 color',
                    defaultValue: "#ffbb00",
                    type: "color",
                },
                {
                    key: 'renderSecondSpiral',
                    label: 'Second spiral',
                    defaultValue: false,
                    type: 'checkbox'
                },
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

        this.center = this.size.map(v => v / 2);
        this.radius = Math.min(...this.center) - MARGIN;
    }

    getPoint({step = 0, stepAngle, rotation = 0, inverse = false}) {
        let point = [
            Math.cos(step * stepAngle + rotation) * this.radius,
            Math.sin(step * stepAngle + rotation) * this.radius,
        ];
        
        if (inverse) {
            point = point.reverse();
        };

        return [
            this.center[0] + point[0],
            this.center[1] + point[1]
        ];
    }

    drawSpiral({ rotation, color = "#f00", inverse } = {}) {
        const {n, repetition, innerLength, showNails, showStrings} = this.config;
        const stepAngle = Math.PI * 2 / n;
        
        this.contextStrings.moveTo(...this.getPoint({ stepAngle: 0, rotation, inverse }));
        this.contextStrings.beginPath();
        
        let currentInnerLength = innerLength;
        let repetitionCount = 0;
        
        for(let i=0; currentInnerLength; i++) {
            this.drawPoint(this.getPoint({step: i + currentInnerLength, stepAngle, rotation, inverse}));
            this.drawPoint(this.getPoint({ step: i + 1, stepAngle, rotation, inverse}));

            repetitionCount++;
            if (repetitionCount === repetition) {
                currentInnerLength--;
                repetitionCount = 0;
            }
        }
      
        this.contextStrings.strokeStyle = color;
        this.contextStrings.stroke();
    }

    drawPoint(point) {
        if (this.config.showStrings) {
            this.contextStrings.lineTo(...point);
        }
        if (this.config.showNails) {
            this.nails.addNail(point);
        }
    }

    render({ color1, color2, renderSecondSpiral, showNails }) {
        this.drawSpiral({ color: color1, rotation: Math.PI * 1.5 });
        if (renderSecondSpiral) {
            this.drawSpiral({ rotation: Math.PI, color: color2, inverse: true});
        }

        if (showNails) {
            this.nails.fill();
        }
    }
}

export default Spiral;