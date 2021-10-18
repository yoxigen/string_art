import StringArt from "../StringArt.js";
import Circle from "./Circle.js";

const MARGIN = 20;

export default class Star extends StringArt{
    name = "Star";
    id = "star";
    link = "https://www.etsy.com/listing/557818258/string-art-meditation-geometric-yoga?epik=dj0yJnU9Mm1hYmZKdks1eTc3bVY2TkVhS2p2Qlg0N2dyVWJxaTEmcD0wJm49MGlWSXE1SVJ2Vm0xZ0xtaGhITDBWQSZ0PUFBQUFBR0Zwd2lj";
    controls = [
        {
            key: 'n',
            label: 'Circle of nails',
            defaultValue: 120,
            type: "range",
            attr: {
                min: 3,
                max: 300,
                step: 1
            }
        },
        {
            key: 'sides',
            label: 'Sides',
            defaultValue: 3,
            type: 'range',
            attr: {
                min: 3,
                max: 20,
                step: 1
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
                    key: 'innerColor',
                    label: 'Star color',
                    defaultValue: "#2ec0ff",
                    type: "color",
                },
                {
                    key: 'outterColor',
                    label: 'Outter color',
                    defaultValue: "#2a82c6",
                    type: "color",
                },
            ]
        }
    ];

    get n() {
        if (!this._n) {
            const {n, sides} = this.config;
            const extraNails = n % sides;
            this._n = n - extraNails;
        }

        return this._n;
    }

    setUpDraw() {
        this._n = null;
        super.setUpDraw();

        const { sides, rotation } = this.config;
        this.circle = new Circle({
            size: this.size,
            n: this.n,
            margin: MARGIN,
            rotation,
        });

        this.sideAngle = Math.PI * 2 / sides;
        let sideNails = Math.floor(this.n / sides);
        this.nailSpacing = this.circle.radius / sideNails;
        this.starCenterStart = (sideNails % 1) * this.nailSpacing;
        this.sideNails = sideNails;
        
        const circleNailsPerSide = this.n / sides;

        this.sides = new Array(sides).fill(null).map((_, side) => {
            const sideAngle = side * this.sideAngle + this.circle.rotationAngle;
            const circlePointsStart = side * circleNailsPerSide;

            return {
                sinSideAngle: Math.sin(sideAngle),
                cosSideAngle: Math.cos(sideAngle),
                circlePointsStart,
                circlePointsEnd: circlePointsStart + circleNailsPerSide
            };
        });
    }

    getStarPoint({ side, sideIndex }) {
        const radius = this.starCenterStart + sideIndex * this.nailSpacing;
        const {sinSideAngle, cosSideAngle} = this.sides[side];
        const [centerX, centerY] = this.circle.center;

        return [
            centerX + sinSideAngle * radius,
            centerY + cosSideAngle * radius
        ];
    }

    *generateStarPoints({ reverseOrder  = false} = {}) {
        for (let side = 0; side < this.config.sides; side++) {
            const prevSide = side === 0 ? this.config.sides - 1 : side - 1;
            for (let i=0; i < this.sideNails; i++) {
                const sideIndex = reverseOrder ? this.sideNails - i : i;
                yield { side, prevSide, sideIndex, point: this.getStarPoint({ side, sideIndex }) };
            }
        }
    }

    *drawStar() {
        const {innerColor} = this.config;

        this.ctx.strokeStyle = innerColor;
        let prevPoint;

        for (const { prevSide, sideIndex, point} of this.generateStarPoints()) {
            this.ctx.beginPath();

            if (sideIndex && !(sideIndex % 2)) {
                this.ctx.moveTo(...prevPoint);
                this.ctx.lineTo(...point);
            } else {
                this.ctx.moveTo(...point);
            }

            const prevSideIndex = this.sideNails - sideIndex;
            this.ctx.lineTo(...this.getStarPoint({ side: prevSide, sideIndex: prevSideIndex}))
            prevPoint = point;
            this.ctx.stroke();
            yield;
        }
    }

    *drawCircle() {
        const {outterColor, sides} = this.config;

        let prevCirclePoint;
        let isPrevSide = false;
        this.ctx.strokeStyle = outterColor;
        for (const { side, prevSide, sideIndex, point} of this.generateStarPoints({ reverseOrder: true })) {
            this.ctx.beginPath();
            if (!prevCirclePoint) {
                prevCirclePoint = this.circle.getPoint(this.sides[prevSide].circlePointsStart);
            }
           
            this.ctx.moveTo(...prevCirclePoint);

            this.ctx.lineTo(...point);
            this.ctx.stroke();

            yield;

            this.ctx.beginPath();
            this.ctx.moveTo(...point);
            const nextPointIndex = isPrevSide 
                ? this.sides[prevSide].circlePointsEnd - sideIndex 
                : this.sides[side].circlePointsStart + sideIndex;

            const nextPoint = this.circle.getPoint(nextPointIndex);
            this.ctx.lineTo(...nextPoint);

            prevCirclePoint = this.circle.getPoint(isPrevSide 
                ? this.sides[prevSide].circlePointsEnd - sideIndex + 1
                : this.sides[side].circlePointsStart + sideIndex - 1);

            this.ctx.lineTo(...prevCirclePoint);

            this.ctx.stroke();
            isPrevSide = !isPrevSide;
            yield;
        }
    }

    *generateStrings() {
        yield* this.drawCircle();
        yield* this.drawStar();
    }

    drawNails() {
        this.circle.drawNails(this.nails);

        for (const {point} of this.generateStarPoints()) {
            this.nails.addNail({ point });
        }

        this.circle.drawNails(this.nails);
    }

    getStepCount() {
        const {sides} = this.config;
        const sideNails = Math.floor(this.n / sides);
        const starCount = sideNails * sides;
        return starCount * 3;
    }
}