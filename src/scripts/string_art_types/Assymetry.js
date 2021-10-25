import StringArt from "../StringArt.js";
import Circle from "./Circle.js";

export default class Assymetry extends StringArt{
    name = "Assymetry";
    id = "assymetry";
    link = "https://www.etsy.com/listing/557818258/string-art-meditation-geometric-yoga?epik=dj0yJnU9Mm1hYmZKdks1eTc3bVY2TkVhS2p2Qlg0N2dyVWJxaTEmcD0wJm49MGlWSXE1SVJ2Vm0xZ0xtaGhITDBWQSZ0PUFBQUFBR0Zwd2lj";
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
            key: 'start',
            label: 'Start Position',
            defaultValue: 0.25,
            type: 'range',
            attr: {
                min: 0,
                max: 0.5,
                step: 0.01
            }
        },
        {
            key: 'start2',
            label: 'Start Position 2',
            defaultValue: 0,
            type: 'range',
            attr: {
                min: 0,
                max: 0.5,
                step: 0.01
            }
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
        {
            key: 'colorGroup',
            label: 'Color',
            type: 'group',
            children: [
                {
                    key: 'color1',
                    label: 'Color layer 1',
                    defaultValue: "#6aee68",
                    type: "color",
                },
                {
                    key: 'color2',
                    label: 'Color layer 2',
                    defaultValue: "#ffffff",
                    type: "color",
                },
            ]
        }
    ];

    setUpDraw() {
        super.setUpDraw();
        Object.assign(this, this.getSetUp());
    }

    getSetUp() {
        const { rotation, n, start, start2, margin = 0 } = this.config;
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
        const startingIndex = Math.round(n * start) + lineNailCount;
        const startingIndex2 = Math.round(n * start2) + lineNailCount;
        const totalNailCount = lineNailCount + n;

        return {
            circle,
            lineSpacing,
            lineNailCount,
            firstCirclePoint,
            startingIndex,
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

    *drawInnerCircle({startIndex, color}) {
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

    *generateStrings() {
        const {color1, color2} = this.config;
        yield* this.drawInnerCircle({
            startIndex: this.startingIndex,
            color: color1
        });

        yield* this.drawInnerCircle({
            startIndex: this.startingIndex2,
            color: color2
        });
    }

    drawNails() {
        this.circle.drawNails(this.nails);

        for (let i=0; i < this.lineNailCount; i++) {
            this.nails.addNail({ point: this.getPoint(i) });
        }
    }

    getStepCount() {
        const {totalNailCount, lineNailCount, startingIndex, startingIndex2} = this.getSetUp();
        const layer1Count = totalNailCount + lineNailCount - startingIndex + 1;
        const layer2Count = totalNailCount + lineNailCount - startingIndex2 + 1;
        return layer1Count + layer2Count;
    }
}
