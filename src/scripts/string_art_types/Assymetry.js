import StringArt from "../StringArt.js";
import Circle from "./Circle.js";

export default class Assymetry extends StringArt{
    name = "Assymetry";
    id = "assymetry";
    link = "https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for";
    controls = [
        {
            key: 'n',
            label: 'Circle nails',
            defaultValue: 144,
            type: 'range',
            attr: {
                min: 3,
                max: 300,
                step: 1
            }
        },
        Circle.rotationConfig,
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
                            key: 'size1',
                            label: 'Size',
                            defaultValue: 0.25,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 0.5,
                                step: ({config: {n}}) => 1 / n
                            },
                            displayValue: ({size1, n}) => Math.round(n * size1),
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
                            label: 'Color',
                            defaultValue: "#a94fb0",
                            type: "color",
                            show: ({show1}) => show1,
                        },
                        {
                            key: 'reverse1',
                            label: 'Reverse',
                            defaultValue: false,
                            type: 'checkbox',
                            show: ({show1}) => show1
                        },
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
                            key: 'size2',
                            label: 'Size',
                            defaultValue: 0.125,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 0.5,
                                step: ({config: {n}}) => 1 / n
                            },
                            displayValue: ({size2, n}) => Math.round(n * size2),
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
                            label: 'Color',
                            defaultValue: "#ec6ad0",
                            type: "color",
                            show: ({show2}) => show2,
                        },
                        {
                            key: 'reverse2',
                            label: 'Reverse',
                            defaultValue: false,
                            type: 'checkbox',
                            show: ({show2}) => show2
                        },
                    ]
                },
                {
                    key: 'layer3',
                    label: 'Layer 3',
                    type: 'group',
                    children: [
                        {
                            key: 'show3',
                            label: 'Enable',
                            defaultValue: true,
                            type: 'checkbox'
                        },
                        {
                            key: 'size3',
                            label: 'Size',
                            defaultValue: 0,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 0.5,
                                step: ({config: {n}}) => 1 / n
                            },
                            displayValue: ({size3, n}) => Math.round(n * size3),
                            show: ({show3}) => show3,
                        },
                        {
                            key: 'end3',
                            label: 'End Position',
                            defaultValue: 0.826,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: ({config: {n}}) => 1 / n
                            },
                            displayValue: ({end2, n}) => Math.round(n * end2),
                            show: ({show3}) => show3,
                        },
                        {
                            key: 'color3',
                            label: 'Color',
                            defaultValue: "#f08ad5",
                            type: "color",
                            show: ({show3}) => show3,
                        },
                        {
                            key: 'reverse3',
                            label: 'Reverse',
                            defaultValue: true,
                            type: 'checkbox',
                            show: ({show3}) => show3
                        },
                    ]
                }
            ]
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
            rotation: rotation - 0.25,
        });

        let lineSpacing = circle.indexAngle * circle.radius;
        const lineNailCount = Math.floor(circle.radius / lineSpacing) - 1;
        lineSpacing += (circle.radius - lineSpacing * lineNailCount) / lineNailCount;
        const firstCirclePoint = circle.getPoint(0);
        const totalNailCount = lineNailCount + n;
        const totalIndexCount = totalNailCount + lineNailCount;
        const layers = new Array(3).fill(null)
            .map((_, i) => getLayer.call(this, i + 1))
            .filter(({enable}) => enable)

        return {
            circle,
            lineSpacing,
            lineNailCount,
            firstCirclePoint,
            layers,
            totalNailCount,
            totalIndexCount,
        };

        function getLayer(layerIndex) {
            const size = Math.round(n * this.config['size' + layerIndex]) + lineNailCount
            return {
                size,
                endIndex: Math.round(this.config['end' + layerIndex] * (totalNailCount + lineNailCount)) - size,
                color: this.config['color' + layerIndex],
                enable: this.config['show' + layerIndex],
                isReverse: this.config['reverse' + layerIndex],
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

    *drawCircle({endIndex, color, isReverse, size}) {
        let prevPoint;
        let prevPointIndex;
        let isPrevSide = false;
        this.ctx.strokeStyle = color;
        const self = this;
        const advance = isReverse ? -1 : 1;

        for(let index = 0; index <= endIndex; index++) {
            this.ctx.beginPath();

            if (prevPoint) {
                this.ctx.moveTo(...prevPoint);
                this.ctx.lineTo(...this.getPoint(prevPointIndex + advance));
            } else {
                this.ctx.moveTo(...this.getPoint(getPointIndex(index)));
            }

            prevPointIndex = getPointIndex(isPrevSide ? index : index + size);
            prevPoint = this.getPoint(prevPointIndex);
            this.ctx.lineTo(...prevPoint);
            this.ctx.stroke();

            yield;

            isPrevSide = !isPrevSide;
        }

        function getPointIndex(index) {
            return isReverse ? self.totalIndexCount - index : index;
        }
    }

    *generateStrings() {
        for (const layer of this.layers) {
            yield* this.drawCircle(layer);
        }
    }

    drawNails() {
        this.circle.drawNails(this.nails, { nailsNumberStart: this.lineNailCount });

        for (let i=0; i < this.lineNailCount; i++) {
            this.nails.addNail({ point: this.getPoint(i), number: i });
        }
    }

    getStepCount() {
        const {layers} = this.getSetUp();
        return layers.reduce((stepCount, layer) =>
            stepCount + layer.endIndex + 1, 0
        );
    }
}
