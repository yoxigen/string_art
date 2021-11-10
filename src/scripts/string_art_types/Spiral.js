import Color from "../helpers/Color.js";
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
            defaultValue: 200,
            type: "range",
            attr: {
                min: 3,
                max: 300,
                step: 1
            }
        },
        {
            key: 'repetition',
            label: 'Repetition',
            defaultValue: 1,
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
            defaultValue: 0.5,
            type: "range",
            attr: {
                min: ({config: {n}}) => 1 / n,
                max: 1,
                step: ({config: {n}}) => 1 / n,
            },
            displayValue: ({n, innerLength}) => Math.round(n * innerLength)
        },
        {
            ...Circle.rotationConfig,
            defaultValue: 0.5,
        },
        {
            key: 'layers',
            label: 'Layers',
            defaultValue: 11,
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
            defaultValue: 0.075,
            type: "range",
            attr: {
                min: 0,
                max: 1,
                step: ({config: {n}}) => 1 / n
            },
            displayValue: ({layerSpread, n}) => Math.round(layerSpread * n)
        },
        Color.getConfig({ defaults: {
            isMultiColor: true,
            multicolorRange: 216,
            multicolorStart: 263,
            color: "#ffffff",
            multicolorByLightness: true,
            minLightness: 10,
            maxLightness: 90
        }}),
    ];

    setUpDraw() {
        super.setUpDraw();
        const { n, rotation, layers, layerSpread } = this.config;

        this.circle = new Circle({
            size: this.size,
            n,
            rotation,
            margin: 20,
        });

        this.color = new Color({
            ...this.config,
            colorCount: layers
        });

        this.layerShift = Math.round(n * layerSpread);
    }

    *drawSpiral({ shift = 0, color = "#f00" } = {}) {
        const {repetition, innerLength, n} = this.config;

        let currentInnerLength = Math.round(innerLength * n);
        let repetitionCount = 0;
        this.ctx.strokeStyle = color;
        let prevPoint = this.circle.getPoint(shift);
        let isPrevPoint = false;

        for(let i=0; currentInnerLength > 0; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(...prevPoint);
            const nextPointIndex = isPrevPoint ? i + shift : i + currentInnerLength + shift;

            this.ctx.lineTo(...this.circle.getPoint(nextPointIndex));
            repetitionCount++;
            if (repetitionCount === repetition) {
                currentInnerLength--;
                repetitionCount = 0;
                i++;
                this.ctx.lineTo(...this.circle.getPoint(nextPointIndex + 1));
                prevPoint = this.circle.getPoint(nextPointIndex + 2);
            } else {
                prevPoint = this.circle.getPoint(nextPointIndex + 1);
            }

            this.ctx.lineTo(...prevPoint);
            this.ctx.stroke();

            yield i;
            isPrevPoint = !isPrevPoint;
        }
      
    }

    *generateStrings() {
        const { layers } = this.config;
        for(let layer = 0; layer < layers; layer++) {
            yield* this.drawSpiral({ 
                color: this.color.getColor(layer), 
                shift: -this.layerShift * layer 
            });
        }
    }

    getStepCount() {
        const {innerLength, repetition, layers, n} = this.config;
        return layers * Math.round(innerLength * n) * repetition;
    }

    drawNails() {
        this.circle.drawNails(this.nails);
    }
}