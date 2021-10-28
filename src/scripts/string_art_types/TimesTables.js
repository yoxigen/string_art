import StringArt from "../StringArt.js";
import Circle from "./Circle.js";

const MARGIN = 20;

export default class TimesTables extends StringArt{
    name = "Times Tables";
    id = "times_tables";
    link = "https://www.youtube.com/watch?v=LWin7w9hF-E&ab_channel=Jorgedelatierra";
    controls = [
        {
            key: 'n',
            label: 'Number of nails',
            defaultValue: 180,
            type: "range",
            attr: {
                min: 3,
                max: 240,
                step: 1
            }
        },
        {
            key: 'base',
            label: 'Multiplication',
            defaultValue: 2,
            type: "range",
            attr: {
                min: 2,
                max: 99,
                step: 1
            }
        },
        {
            key: 'layers',
            label: 'Layers',
            defaultValue: 7,
            type: "range",
            attr: {
                min: 1,
                max: 20,
                step: 1
            }
        },
        Circle.rotationConfig,
        {
            key: 'colorGroup',
            label: 'Color',
            type: 'group',
            children: [
                {
                    key: 'multicolor',
                    label: 'Use multiple colors',
                    defaultValue: true,
                    type: "checkbox",
                },
                {
                    key: 'multicolorRange',
                    label: 'Multicolor range',
                    defaultValue: 180,
                    type: "range",
                    attr: {
                        min: 1,
                        max: 360,
                        step: 1
                    },
                    show: ({multicolor}) => multicolor,
                },
                {
                    key: 'multicolorStart',
                    label: 'Multicolor start',
                    defaultValue: 256,
                    type: "range",
                    attr: {
                        min: 0,
                        max: 360,
                        step: 1
                    },
                    show: ({multicolor}) => multicolor,
                },
                {
                    key: 'color',
                    label: 'String color',
                    defaultValue: "#ff4d00",
                    type: "color",
                    show: ({multicolor}) => !multicolor
                },
            ]
        },
    ];

    get n() {
        if (!this._n) {
            const {n, layers} = this.config;
            const extraNails = n % layers;
            this._n = n - extraNails; // The number of nails should be a multiple of the layers, so the strings are exactly on the nails.
        }

        return this._n;
    }

    setUpDraw() {
        this._n = null;
        super.setUpDraw();

        const {layers, multicolorRange, rotation} = this.config;
        this.circle = new Circle({
            size: this.size,
            n: this.n,
            margin: MARGIN,
            rotation,
        });
        this.multiColorStep = multicolorRange / layers;
        this.layerShift = Math.floor(this.n / layers);
    }

    *drawTimesTable({ shift = 0, color = "#f00", steps, time }) {
        const {base} = this.config;
        const n = this.n;
        const stepsToRender = steps ?? n;

        let point = this.circle.getPoint(shift);

        for(let i=1; i <= stepsToRender; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(...point);
            point = this.circle.getPoint(i + shift);
            this.ctx.lineTo(...point);
            const toIndex = (i * base) % n;
            this.ctx.lineTo(...this.circle.getPoint(toIndex + shift));
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
            
            yield { instructions: `${i - 1} → ${i} → ${toIndex} → ${i}`, index: time * n + i };
        }
    }

    *generateStrings() {
        const {color, multicolor, layers} = this.config;

        for(let time = 0; time < layers; time++) {
            const timeColor = multicolor ? this.getTimeColor(time, layers) : color;
            yield* this.drawTimesTable({ 
                time,
                color: timeColor, 
                shift: this.layerShift * time,
            });
        }
    }

    drawNails() {
        this.circle.drawNails(this.nails);
    }

    getTimeColor(time) {
        const {multicolorStart, darkMode} = this.config;

        return `hsl(${multicolorStart + time * this.multiColorStep}, 80%, ${darkMode ? 50 : 40}%)`;
    }

    getStepCount() {
        return this.config.layers * this.n;
    }
}
            