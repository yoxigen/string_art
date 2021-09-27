import StringArt from "../StringArt.js";

const SIDES = ['left', 'bottom', 'right', 'top'];
const MARGIN = 20;

class Eye extends StringArt{
    constructor(canvas) {
        super({
            name: "Eye",
            id: 'eye',
            link: "https://www.pinterest.com/pin/21181060738086735/",
            configControls: [
                {
                    key: 'n',
                    label: 'Number of nails per side',
                    defaultValue: 50,
                    type: "range",
                    attr: {
                        min: 2,
                        max: 200,
                        step: 1
                    }
                },
                {
                    key: 'color1',
                    label: 'String #1 color',
                    defaultValue: "#000e75",
                    type: "color",
                },
                {
                    key: 'color2',
                    label: 'String #2 color',
                    defaultValue: "#0040ff",
                    type: "color",
                },
                {
                    key: 'shapeColor',
                    label: 'Shape color',
                    defaultValue: "#99000f",
                    type: "color",
                },
                {
                    key: 'showShape',
                    label: 'Show shape',
                    defaultValue: true,
                    type: "checkbox",
                }
            ],
            canvas
        })
    }

    beforeDraw() {
        if (this.contextShape) {
            this.contextShape.clearRect(0, 0, ...this.size);
	        this.contextStrings.clearRect(0, 0, ...this.size);
        } else {
            this.contextShape = this.canvas.getContext("2d");
            this.contextStrings = this.canvas.getContext("2d");
        }

        this.nailSpacing = (this.size[0] - 2 * MARGIN) / this.config.n;
    }
    
    getSize(size) {
        const smallestSize = Math.min(...size);
        return [smallestSize, smallestSize];
    }

    drawShape({shapeColor}) {
        this.contextShape.beginPath();
        this.contextShape.rect(MARGIN, MARGIN, this.width - 2 * MARGIN, this.height - 2 * MARGIN)

        this.contextShape.strokeStyle = shapeColor;
        this.contextShape.stroke();
    }

    // Sides: top, right, bottom, left
    getPoint({side, index}) {
        switch(side) {
            case 'left':
                return [MARGIN, MARGIN + index * this.nailSpacing];
            case 'right':
                return [this.width - MARGIN, this.height - index * this.nailSpacing - MARGIN];
            case 'bottom':
                return [MARGIN + index * this.nailSpacing, this.height - MARGIN];
            case 'top':
                return [this.width - index * this.nailSpacing - MARGIN, MARGIN];
        }
    }

    drawSide({ side, color, shift = 0 }) {
        const {n} = this.config;
        this.contextStrings.moveTo(...this.getPoint({ side, index: 0 }));
        this.contextStrings.beginPath();
        
        const sideIndex = SIDES.indexOf(side);
        const nextSide = SIDES[sideIndex === SIDES.length - 1 ? 0 : sideIndex + 1];

        const strings = n - shift;

        for(let i=0; i < strings; i++) {
            this.contextStrings.lineTo(...this.getPoint({side: nextSide, index: i + shift}));
            this.contextStrings.lineTo(...this.getPoint({ side, index: i + 1}));
        }
      
        this.contextStrings.strokeStyle = color;
        this.contextStrings.stroke();
    }

    drawStrings({ color1, color2, n }) {
        const colors = [color1, color2];

        for(let i=0; i < 4; i++) {
            this.drawSide({ color: colors[(i + 1) % colors.length], side: SIDES[i], shift: Math.floor(n / 4) });
        }

        for(let i=0; i < 4; i++) {
            this.drawSide({ color: colors[i % colors.length], side: SIDES[i] });
        }
    }
}

export default Eye;