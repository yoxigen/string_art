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

    setUpDraw() {
        super.setUpDraw();

        if (this.contextStrings) {
	        this.contextStrings.clearRect(0, 0, ...this.size);
        } else {
            this.contextStrings = this.canvas.getContext("2d");
        }

        this.width = this.height =  Math.min(...this.size);
        this.nailSpacing = (this.width - 2 * MARGIN) / this.config.n;
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

    drawSide({ side, color, shift = 0, showStrings = true }) {
        const {n} = this.config;
        if (showStrings) {
            this.contextStrings.moveTo(...this.getPoint({ side, index: 0 }));
            this.contextStrings.beginPath();
        }
        
        const sideIndex = SIDES.indexOf(side);
        const nextSide = SIDES[sideIndex === SIDES.length - 1 ? 0 : sideIndex + 1];

        const strings = n - shift;

        for(let i=0; i < strings; i++) {
            this.drawPoint(this.getPoint({side: nextSide, index: i + shift}));
            this.drawPoint(this.getPoint({ side, index: i + 1}));
        }
      
        this.contextStrings.strokeStyle = color;
        this.contextStrings.stroke();
    }

    drawPoint(point) {
        if (this.config.showStrings) {
            this.contextStrings.lineTo(...point);
        }

        if (this.config.showNails) {
            this.nails.addNail({point});
        }
    }

    render( { color1, color2, showStrings, showNails }) {
        const colors = [color1, color2];

        for(let i=0; i < 4; i++) {
            this.drawSide({ 
                color: colors[i % colors.length], 
                side: SIDES[i],
                showStrings
            });
        }

        if (showNails) {
            this.nails.fill();
        }
    }
}

export default Eye;