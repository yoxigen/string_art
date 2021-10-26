import StringArt from "../StringArt.js";
import Circle from "./Circle.js";

export default class Assymetry extends StringArt{
    name = "Assymetry";
    id = "assymetry";
    link = "https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for";
    controls = [
        {
            key: 'n',
            label: 'Nails',
            defaultValue: 144,
            type: 'range',
            attr: {
                min: 3,
                max: 300,
                step: 1
            }
        },
        {
            key: 'layers',
            label: 'Layers',
            type: 'group',
            children: [
                {
                    key: 'layer1',
                    label: 'Layer 1',
                    type: 'group',
                    children: [
                        {
                            key: 'show1',
                            label: 'Enable',
                            defaultValue: true,
                            type: 'checkbox'
                        },
                        {
                            key: 'start1',
                            label: 'Start Position',
                            defaultValue: 0.25,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 0.5,
                                step: ({config: {n}}) => 1 / n
                            },
                            displayValue: ({start1, n}) => Math.round(n * start1),
                            show: ({show1}) => show1,
                        },
                        {
                            key: 'end1',
                            label: 'End Position',
                            defaultValue: 1,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: ({config: {n}}) => 1 / n,
                            },
                            displayValue: ({end1, n}) => Math.round(n * end1),
                            show: ({show1}) => show1,
                        },
                        {
                            key: 'color1',
                            label: 'Color layer 1',
                            defaultValue: "#6aee68",
                            type: "color",
                            show: ({show1}) => show1,
                        }
                    ]
                },
                {
                    key: 'layer2',
                    label: 'Layer 2',
                    type: 'group',
                    children: [
                        {
                            key: 'show2',
                            label: 'Enable',
                            defaultValue: true,
                            type: 'checkbox'
                        },
                        {
                            key: 'start2',
                            label: 'Start Position 2',
                            defaultValue: 0.125,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 0.5,
                                step: ({config: {n}}) => 1 / n
                            },
                            displayValue: ({start2, n}) => Math.round(n * start2),
                            show: ({show2}) => show2,
                        },
                        {
                            key: 'end2',
                            label: 'End Position',
                            defaultValue: 0.888,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: ({config: {n}}) => 1 / n
                            },
                            displayValue: ({end2, n}) => Math.round(n * end2),
                            show: ({show2}) => show2,
                        },
                        {
                            key: 'color2',
                            label: 'Color layer 2',
                            defaultValue: "#ffffff",
                            type: "color",
                            show: ({show2}) => show2,
                        },
                    ]
                }
            ]
        },
        {
            key: 'rotation',
            label: 'Rotation',
            defaultValue: 0,
            type: "range",
            attr: {
                min: 0,
                max: 1,
                step: 0.01,
            }
        },
    ];

    setUpDraw() {
        super.setUpDraw();
        Object.assign(this, this.getSetUp());
    }

    getSetUp() {
        const { rotation, n, margin = 0 } = this.config;
        const circle = new Circle({
            size: this.getSize(),
            n,
            margin,
            rotation,
        });

        let lineSpacing = circle.indexAngle * circle.radius;
        const lineNailCount = Math.floor(circle.radius / lineSpacing) - 1;
        lineSpacing += (circle.radius - lineSpacing * lineNailCount) / lineNailCount;
        const firstCirclePoint = circle.getPoint(0);
        const totalNailCount = lineNailCount + n;
        const layers = new Array(2).fill(null)
            .map((_, i) => getLayer.call(this, i + 1))
            .filter(({enable}) => enable)

        return {
            circle,
            lineSpacing,
            lineNailCount,
            firstCirclePoint,
            layers,
            totalNailCount,
        };

        function getLayer(layerIndex) {
            return {
                startIndex: Math.round(n * this.config['start' + layerIndex]) + lineNailCount,
                endIndex: Math.round(this.config['end' + layerIndex] * (totalNailCount + lineNailCount)),
                color: this.config['color' + layerIndex],
                enable: this.config['show' + layerIndex],
            };
        }
    }

    /**
     * Returns the position of a point on the line
     * @param {index of the point in the circle, 0 is the center} index
     */
    getPoint(index) {
        if (index < this.lineNailCount || index > this.totalNailCount) {
            const linePosition = index < this.lineNailCount ? this.lineNailCount - index : index - this.totalNailCount;

            const indexLength = (linePosition) * this.lineSpacing;
            return [
                this.firstCirclePoint[0] - indexLength * Math.sin(this.circle.rotationAngle),
                this.firstCirclePoint[1] - indexLength * Math.cos(this.circle.rotationAngle)
            ];
        } else {
            const circleIndex = index - this.lineNailCount;
            return this.circle.getPoint(circleIndex);
        }
    }

    *generateCircleIndexes(start, end) {
        for(let i=start; i <= end; i++) {
            yield i;
        }
    }

    *drawCircle({startIndex, endIndex, color}) {
        let prevPoint;
        let prevPointIndex;
        let isPrevSide = false;
        this.ctx.strokeStyle = color;

        for (const index of this.generateCircleIndexes(startIndex, endIndex)) {
            this.ctx.beginPath();

            if (prevPoint) {
                this.ctx.moveTo(...prevPoint);
                this.ctx.lineTo(...this.getPoint(prevPointIndex + 1));
            } else {
                prevPoint = this.getPoint(startIndex)
                this.ctx.moveTo(...prevPoint);
            }

            prevPointIndex = isPrevSide ? index : index - startIndex;
            prevPoint = this.getPoint(prevPointIndex);
            this.ctx.lineTo(...prevPoint);
            this.ctx.stroke();

            yield;

            isPrevSide = !isPrevSide;
        }
    }

    *generateStrings() {
        for (const layer of this.layers) {
            yield* this.drawCircle(layer);
        }
    }

    drawNails() {
        this.circle.drawNails(this.nails);

        for (let i=0; i < this.lineNailCount; i++) {
            this.nails.addNail({ point: this.getPoint(i) });
        }
    }

    getStepCount() {
        const {layers} = this.getSetUp();
        return layers.reduce((stepCount, layer) =>
            stepCount + layer.endIndex - layer.startIndex + 1, 0
        );
    }
}
