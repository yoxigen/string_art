import StringArt from "../StringArt.js";

const MARGIN = 20;
const PI2 = Math.PI * 2;

export default class TimesTables extends StringArt{
    constructor(canvas) {
        super({
            canvas,
            name: "Times Tables",
            id: 'times_tables',
            link: "https://www.youtube.com/watch?v=qhbuKbxJsk8&ab_channel=Mathologer",
            configControls: [
                {
                    key: 'n',
                    label: 'Number of nails',
                    defaultValue: 180,
                    type: "range",
                    attr: {
                        min: 3,
                        max: 200,
                        step: 1
                    }
                },
                {
                    key: 'base',
                    label: 'Multiplication',
                    defaultValue: 2,
                    type: "range",
                    attr: {
                        min: 1,
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
                        max: 200,
                        step: 1
                    }
                },
                {
                    key: 'color',
                    label: 'String color',
                    defaultValue: "#ff4d00",
                    type: "color",
                },
                {
                    key: 'multicolor',
                    label: 'Multicolor',
                    defaultValue: true,
                    type: "checkbox",
                },
            ],
        });
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
        this.indexAngle = PI2 / this.config.n;
    }

    getPoint({index = 0, rotation = 0}) {
        return [
            this.center[0] + Math.cos(index * this.indexAngle + rotation) * this.radius,
            this.center[1] + Math.sin(index * this.indexAngle + rotation) * this.radius,
        ];
    }

    drawPoint(point) {
        if (this.config.showStrings) {
            this.contextStrings.lineTo(...point);
        }
        if (this.config.showNails) {
            this.nails.addNail(point);
        }
    }

    drawTimesTable({ rotation, color = "#f00" }) {
        const {n, base, showStrings} = this.config;
        
        this.contextStrings.beginPath();
        this.contextStrings.moveTo(...this.getPoint({ index: 0, rotation }));
        for(let i=0; i < n; i++) {
            const indexPoint = this.getPoint({index: i, rotation});
            this.drawPoint(indexPoint);
            this.drawPoint(this.getPoint({index: (i * base) % n, rotation}));
            this.contextStrings.moveTo(...indexPoint);
        }
      
        if (showStrings) {
            this.contextStrings.strokeStyle = color;
            this.contextStrings.stroke();
        }
    }

    draw() {
        const { color, multicolor, showNails, times } = this.config;
        this.setUpDraw();
        const rotationAngle = PI2 / times;

        for(let i = 0; i < times; i++) {
            this.drawTimesTable({ 
                color: multicolor ? this.getTimeColor(i, times) : color, 
                rotation: rotationAngle * i 
            });
        }

        if (showNails) {
            this.nails.fill();
        }
    }

    getTimeColor(time, times) {
        const colorStep = 360 / times;
        return `hsl(${time * colorStep}, 80%, 50%)`;
    }
}
            