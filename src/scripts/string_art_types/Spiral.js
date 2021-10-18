import StringArt from "../StringArt.js";
import Circle from "./Circle.js";

export default class Spiral extends StringArt{
    id = "spiral";
    name = "Spiral";
    link = "https://www.etsy.com/il-en/listing/943140543/personalized-gift-string-art-mandala?ref=sim_rv-5&pro=1";
    controls = [
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
    ];

    setUpDraw() {
        super.setUpDraw();
        const { n, rotation } = this.config;

        this.circle = new Circle({
            size: this.size,
            n,
            rotation,
            margin: 20,
        });
        const {layers, multicolorRange, multicolorByLightness, layerSpread} = this.config;
        this.multiColorStep = multicolorRange / layers;
        this.multiColorLightnessStep = multicolorByLightness ? 100 / layers : 1;
        this.layerShift = layerSpread;
    }

    *drawSpiral({ shift = 0, color = "#f00" } = {}) {
        const {repetition, innerLength} = this.config;
        
        this.ctx.moveTo(...this.circle.getPoint(shift));
        
        let currentInnerLength = innerLength;
        let repetitionCount = 0;
        this.ctx.strokeStyle = color;
        
        for(let i=0; currentInnerLength; i++) {
            this.ctx.beginPath();
            this.ctx.lineTo(...this.circle.getPoint(i + currentInnerLength + shift));
            this.ctx.lineTo(...this.circle.getPoint(i + 1 + shift));
            this.ctx.stroke();

            repetitionCount++;
            if (repetitionCount === repetition) {
                currentInnerLength--;
                repetitionCount = 0;
            }

            yield i;
        }
      
    }

    *generateStrings() {
        const { layers } = this.config;
        for(let layer = 0; layer < layers; layer++) {
            yield* this.drawSpiral({ 
                color: this.getLayerColor(layer), 
                shift: -this.layerShift * layer 
            });
        }
    }

    getLayerColor(layer) {
        const {multicolorStart, darkMode, multicolorByLightness} = this.config;
        const lightness = multicolorByLightness ? this.multiColorLightnessStep * layer : darkMode ? 50 : 40;

        return `hsl(${multicolorStart + layer * this.multiColorStep}, 80%, ${lightness}%)`;
    }

    getStepCount() {
        const {innerLength, repetition, layers} = this.config;
        return layers * innerLength * repetition;
    }

    drawNails() {
        this.circle.drawNails(this.nails);
    }
}