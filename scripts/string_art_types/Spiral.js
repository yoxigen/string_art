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
                    key: 'shapeColor',
                    label: 'Shape color',
                    defaultValue: "#99000f",
                    type: "color",
                },
                {
                    key: 'renderSecondSpiral',
                    label: 'Second spiral',
                    defaultValue: true,
                    type: 'checkbox'
                },
                {
                    key: 'showShape',
                    label: 'Show shape',
                    defaultValue: true,
                    type: "checkbox",
                }
            ],
            canvas
        })
    }

    beforeDraw() {
        if (this.contextShape) {
            this.contextShape.clearRect(0, 0, ...this.size);
	        this.contextStrings.clearRect(0, 0, ...this.size);
        } else {
            this.contextShape = this.canvas.getContext("2d");
            this.contextStrings = this.canvas.getContext("2d");
        }

        this.center = Math.min(...this.size) / 2;
        this.radius = this.center - MARGIN;
    }
    
    getSize(size) {
        const smallestSize = Math.min(...size);
        return [smallestSize, smallestSize];
    }

    drawShape({shapeColor}) {
        this.contextShape.beginPath();
        this.contextShape.arc(this.center, this.center, this.radius, 0, Math.PI * 2)

        this.contextShape.strokeStyle = shapeColor;
        this.contextShape.stroke();
    }

    getPoint({step = 0, stepAngle, rotation = 0, inverse = false}) {
        const point = [
            this.center + Math.cos(step * stepAngle + rotation) * this.radius,
            this.center + Math.sin(step * stepAngle + rotation) * this.radius,
        ];
        return inverse ? point.reverse() : point;
    }

    drawSpiral({ rotation, color = "#f00", inverse } = {}) {
        const {n, repetition, innerLength} = this.config;
        const stepAngle = Math.PI * 2 / n;
        
        this.contextStrings.moveTo(...this.getPoint({ stepAngle: 0, rotation, inverse }));
        this.contextStrings.beginPath();
        
        let currentInnerLength = innerLength;
        let repetitionCount = 0;
        
        for(let i=0; currentInnerLength; i++) {
            this.contextStrings.lineTo(...this.getPoint({step: i + currentInnerLength, stepAngle, rotation, inverse}));
            this.contextStrings.lineTo(...this.getPoint({ step: i + 1, stepAngle, rotation, inverse}));
            
            repetitionCount++;
            if (repetitionCount === repetition) {
                currentInnerLength--;
                repetitionCount = 0;
            }
        }
      
        this.contextStrings.strokeStyle = color;
        this.contextStrings.stroke();
    }

    drawStrings({ color1, color2, renderSecondSpiral }) {
        this.drawSpiral({ color: color1, rotation: Math.PI * 1.5 });
        if (renderSecondSpiral) {
            this.drawSpiral({ rotation: Math.PI, color: color2, inverse: true});
        }
    }
}

export default Spiral;