import StringArt from "../StringArt.js";

const MARGIN = 20;
const PI2 = Math.PI * 2;

export default class TimesTables extends StringArt{
    constructor(canvas) {
        super({
            canvas,
            name: "Times Tables",
            id: 'times_tables',
            link: "https://www.youtube.com/watch?v=LWin7w9hF-E&ab_channel=Jorgedelatierra",
            configControls: [
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
                    key: 'times',
                    label: 'Times',
                    defaultValue: 7,
                    type: "range",
                    attr: {
                        min: 1,
                        max: 20,
                        step: 1
                    }
                },
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
            ],
        });
    }

    getRealNailCount() {
        const {n, times} = this.config;
        const extraNails = n % times;
        return n - extraNails; // The number of nails should be a multiple of the times, so the strings are exactly on the nails.
    }

    setUpDraw() {
        super.setUpDraw();

        this.center = this.size.map(v => v / 2);
        this.radius = Math.min(...this.center) - MARGIN;

        const {n, times, multicolorRange} = this.config;

        this.realNailCount = this.getRealNailCount();
        this.indexAngle = PI2 / this.realNailCount;
        this.multiColorStep = multicolorRange / times;
        this.timeShift = Math.floor(n / times);
    }

    getPoint(index = 0) {
        const pointAngle = index * this.indexAngle;

        return [
            this.center[0] + Math.cos(pointAngle) * this.radius,
            this.center[1] + Math.sin(pointAngle) * this.radius,
        ];
    }

    *drawTimesTable({ shift = 0, color = "#f00", steps, time }) {
        const {base} = this.config;
        const n = this.realNailCount;
        const stepsToRender = steps ?? n;

        let point = this.getPoint(shift);

        for(let i=1; i <= stepsToRender; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(...point);
            point = this.getPoint(i + shift);
            this.ctx.lineTo(...point);
            const toIndex = (i * base) % n;
            this.ctx.lineTo(...this.getPoint(toIndex + shift));
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
            
            yield time * n + i;
        }
    }

    *generateStrings() {
        const {color, multicolor, times} = this.config;

        for(let time = 0; time < times; time++) {
            const timeColor = multicolor ? this.getTimeColor(time, times) : color;
            yield* this.drawTimesTable({ 
                time,
                color: timeColor, 
                shift: this.timeShift * time,
            });
        }
    }

    drawNails() {
        for (let i=0; i < this.realNailCount; i++) {
            this.nails.addNail({point: this.getPoint(i)});
        }
    }

    getTimeColor(time) {
        const {multicolorStart, darkMode} = this.config;

        return `hsl(${multicolorStart + time * this.multiColorStep}, 80%, ${darkMode ? 50 : 40}%)`;
    }

    getStepCount() {
        return this.config.times * this.getRealNailCount();
    }
}
            