import StringArt from "../StringArt.js";

const MARGIN = 20;
const PI2 = Math.PI * 2;

class Spiral extends StringArt{
    constructor(canvas) {
        super({
            name: "Spiral",
            id: 'spiral',
            link: "https://www.etsy.com/il-en/listing/943140543/personalized-gift-string-art-mandala?ref=sim_rv-5&pro=1",
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
                    defaultValue: 2,
                    type: "range",
                    attr: {
                        min: 1,
                        max: 60,
                        step: 1
                    }
                },
                {
                    key: 'innerLength',
                    label: 'Spiral thickness',
                    defaultValue: 72,
                    type: "range",
                    attr: {
                        min: 1,
                        max: 144,
                        step: 1,
                    }
                },
                {
                    key: 'rotation',
                    label: 'Rotation',
                    defaultValue: 0.49,
                    type: "range",
                    attr: {
                        min: 0,
                        max: 1,
                        step: 0.01,
                    }
                },
                {
                    key: 'layers',
                    label: 'Layers',
                    defaultValue: 9,
                    type: "range",
                    attr: {
                        min: 1,
                        max: 20,
                        step: 1
                    }
                },
                {
                    key: 'layerSpread',
                    label: 'Layer spread',
                    defaultValue: 13,
                    type: "range",
                    attr: {
                        min: 1,
                        max: 200,
                        step: 1
                    }
                },
                {
                    key: 'colorGroup',
                    label: 'Color',
                    type: 'group',
                    children: [
                        {
                            key: 'multicolorRange',
                            label: 'Multicolor range',
                            defaultValue: 216,
                            type: "range",
                            attr: {
                                min: 1,
                                max: 360,
                                step: 1
                            },
                        },
                        {
                            key: 'multicolorStart',
                            label: 'Multicolor start',
                            defaultValue: 263,
                            type: "range",
                            attr: {
                                min: 0,
                                max: 360,
                                step: 1
                            },
                        },
                        {
                            key: 'multicolorByLightness',
                            label: 'Multicolor by lightness',
                            defaultValue: true,
                            type: 'checkbox'
                        }
                    ]
                }
            ],
            canvas
        })
    }

    setUpDraw() {
        super.setUpDraw();
        this.center = this.size.map(v => v / 2);
        this.radius = Math.min(...this.center) - MARGIN;

        const {n, layers, multicolorRange, multicolorByLightness, layerSpread, rotation} = this.config;
        this.multiColorStep = multicolorRange / layers;
        this.multiColorLightnessStep = multicolorByLightness ? 100 / layers : 1;
        this.layerShift = layerSpread;
        this.indexAngle = PI2 / n;
        this.rotationAngle = PI2 * rotation;
    }

    getPoint(index = 0) {
        return [
            this.center[0] + Math.sin(index * this.indexAngle + this.rotationAngle) * this.radius,
            this.center[1] + Math.cos(index * this.indexAngle + this.rotationAngle) * this.radius
        ];
    }

    drawSpiral({ shift = 0, color = "#f00" } = {}) {
        const {repetition, innerLength} = this.config;
        
        this.ctx.moveTo(...this.getPoint(shift));
        this.ctx.beginPath();
        
        let currentInnerLength = innerLength;
        let repetitionCount = 0;
        
        for(let i=0; currentInnerLength; i++) {
            this.ctx.lineTo(...this.getPoint(i + currentInnerLength + shift));
            this.ctx.lineTo(...this.getPoint(i + 1 + shift));

            repetitionCount++;
            if (repetitionCount === repetition) {
                currentInnerLength--;
                repetitionCount = 0;
            }
        }
      
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }

    drawNails() {
        const {n} = this.config;
        for (let i=0; i < n; i++) {
            this.nails.addNail({point: this.getPoint(i)});
        }
    }

    render() {
        const { layers, showNails, showStrings } = this.config;
        if (showStrings) {
            for(let layer = 0; layer < layers; layer++) {
                this.drawSpiral({ color: this.getLayerColor(layer), shift: -this.layerShift * layer });
            }
        }
        
        if (showNails) {
            this.drawNails();
            this.nails.fill();
        }
    }

    getLayerColor(layer) {
        const {multicolorStart, darkMode, multicolorByLightness} = this.config;
        const lightness = multicolorByLightness ? this.multiColorLightnessStep * layer : darkMode ? 50 : 40;

        return `hsl(${multicolorStart + layer * this.multiColorStep}, 80%, ${lightness}%)`;
    }
}

export default Spiral;