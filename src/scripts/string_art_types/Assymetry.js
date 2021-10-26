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
                            key: 'start1',
                            label: 'Start Position',
                            defaultValue: 0.25,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 0.5,
                                step: 0.01
                            },
                            displayValue: ({start1, n}) => Math.round(n * start1)
                        },
                        {
                            key: 'color1',
                            label: 'Color layer 1',
                            defaultValue: "#6aee68",
                            type: "color",
                        }
                    ]
                },
                {
                    key: 'layer2',
                    label: 'Layer 2',
                    type: 'group',
                    children: [
                        {
                            key: 'start2',
                            label: 'Start Position 2',
                            defaultValue: 0,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 0.5,
                                step: 0.01
                            },
                            displayValue: ({start2, n}) => Math.round(n * start2)
                        },
                        {
                            key: 'color2',
                            label: 'Color layer 2',
                            defaultValue: "#ffffff",
                            type: "color",
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
        const { rotation, n, start1, start2, margin = 0 } = this.config;
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
        const startingIndex1 = Math.round(n * start1) + lineNailCount;
        const startingIndex2 = Math.round(n * start2) + lineNailCount;
        const totalNailCount = lineNailCount + n;

        return {
            circle,
            lineSpacing,
            lineNailCount,
            firstCirclePoint,
            startingIndex1,
            startingIndex2,
            totalNailCount,
        };
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

    *generateCircleIndexes(start) {
        const lastIndex = this.totalNailCount + this.lineNailCount;
        for(let i=start; i <= lastIndex; i++) {
            yield i;
        }
    }

    *drawCircle({startIndex, color}) {
        let prevPoint;
        let prevPointIndex;
        let isPrevSide = false;
        this.ctx.strokeStyle = color;

        for (const index of this.generateCircleIndexes(startIndex)) {
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

    get layers() {
        const {color1, color2} = this.config;

        return [
            { startIndex: this.startingIndex1, color: color1 },
            { startIndex: this.startingIndex2, color: color2 }
        ];
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
        const {totalNailCount, lineNailCount, startingIndex1, startingIndex2} = this.getSetUp();
        const layer1Count = totalNailCount + lineNailCount - startingIndex1 + 1;
        const layer2Count = totalNailCount + lineNailCount - startingIndex2 + 1;
        return layer1Count + layer2Count;
    }
}
