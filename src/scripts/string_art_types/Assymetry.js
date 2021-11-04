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
            defaultValue: [
                {
                    size: 0.25,
                    end: 1,
                    color: "#a94fb0",
                },
                {
                    size: 0.125,
                    end: 0.888,
                    color: "#ec6ad0"
                },
                {
                    size: 0,
                    end: 0.826,
                    color: "#f08ad5",
                    reverse: true
                }
            ],
            addChild: {
                btnText: 'Add layer',
                getNewChild: ({childIndex, defaultValue}) => {
                    const show = config => config.layers[childIndex].show;
    
                    return {
                        label: `Layer ${childIndex + 1}`,
                        type: 'group',
                        children: [
                            {
                                key: 'show',
                                label: 'Enable',
                                defaultValue: defaultValue.show ?? true,
                                type: 'checkbox'
                            },
                            {
                                key: 'size',
                                label: 'Size',
                                defaultValue: defaultValue.size ?? 0.25,
                                type: 'range',
                                attr: {
                                    min: 0,
                                    max: 0.5,
                                    step: ({config: {n}}) => 1 / n
                                },
                                displayValue: ({value, config: {n}}) => Math.round(n * value),
                                show,
                            },
                            {
                                key: 'end',
                                label: 'End Position',
                                defaultValue: defaultValue.end ?? 1,
                                type: 'range',
                                attr: {
                                    min: 0,
                                    max: 1,
                                    step: ({config: {n}}) => 1 / n,
                                },
                                displayValue: ({value, config: {n}}) => Math.round(n * value),
                                show,
                            },
                            {
                                key: 'color',
                                label: 'Color',
                                defaultValue: defaultValue.color ?? "#a94fb0",
                                type: "color",
                                show,
                            },
                            {
                                key: 'reverse',
                                label: 'Reverse',
                                defaultValue: defaultValue.reverse ?? false,
                                type: 'checkbox',
                                show,
                            },
                        ]
                    };
                }
            },
        },
    ];

    setUpDraw() {
        super.setUpDraw();
        Object.assign(this, this.getSetUp());
    }

    getSetUp() {
        const { rotation, n, margin = 0, layers: layersConfig } = this.config;
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
        const layers = layersConfig
            .filter(({show}) => show)
            .map(getLayer);

        return {
            circle,
            lineSpacing,
            lineNailCount,
            firstCirclePoint,
            layers,
            totalNailCount,
            totalIndexCount,
        };

        function getLayer({ size: sizeConfig, end, color, reverse: isReverse}) {
            const size = Math.round(n * sizeConfig) + lineNailCount
            return {
                size,
                endIndex: Math.round(end * (totalNailCount + lineNailCount)) - size,
                color,
                isReverse,
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
            this.nails.addNail({ point: this.getPoint(i), number: i + 1 });
        }
    }

    getStepCount() {
        const {layers} = this.getSetUp();
        return layers.reduce((stepCount, layer) =>
            stepCount + layer.endIndex + 1, 0
        );
    }
}
