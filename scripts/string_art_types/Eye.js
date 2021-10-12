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
                    defaultValue: 75,
                    type: "range",
                    attr: {
                        min: 2,
                        max: 200,
                        step: 1
                    }
                },
                {
                    key: 'layers',
                    label: 'Layers',
                    defaultValue: 3,
                    type: "range",
                    attr: {
                        min: 1,
                        max: 20,
                        step: 1
                    }
                },
                {
                    key: 'angle',
                    label: 'Layer angle',
                    defaultValue: 16,
                    type: "range",
                    attr: {
                        min: 0,
                        max: 45,
                        step: 1
                    }
                },
                {
                    key: 'color1',
                    label: 'String #1 color',
                    defaultValue: "#44bbad",
                    type: "color",
                },
                {
                    key: 'color2',
                    label: 'String #2 color',
                    defaultValue: "#bc3885",
                    type: "color",
                },
            ],
            canvas
        })
    }

    setUpDraw() {
        super.setUpDraw();

        const { n, angle } = this.config;

        this.width = this.height = Math.min(...this.size);
        this.externalSquareSize = this.width - 2 * MARGIN;
        this.nailSpacing = this.externalSquareSize / (n - 1);
        this.layerAngle = angle * Math.PI / 180;
    }

    // Sides: top, right, bottom, left
    getPoint({side, index, x, y, xSpacing, ySpacing, nLayer}) {
        switch(side) {
            case 'left':
                return [MARGIN + ySpacing * index, MARGIN + y + xSpacing * index];
            case 'right':
                return [MARGIN + x + y - index * ySpacing, MARGIN + (nLayer - index) * xSpacing];
            case 'bottom':
                return [MARGIN + y + xSpacing * index, MARGIN + x + y - index * ySpacing];
            case 'top':
                return [MARGIN + x - index * xSpacing, MARGIN + ySpacing * index];
        }
    }

    *drawSide({ side, color = '#ffffff', angle }) {
        const sideIndex = SIDES.indexOf(side);
        const nextSide = SIDES[sideIndex === SIDES.length - 1 ? 0 : sideIndex + 1];
        
        const layerSize = this.externalSquareSize / (Math.sin(angle) + Math.cos(angle));
        const nLayer = Math.floor(layerSize / this.nailSpacing);
        
        const tanAngle = Math.tan(angle);
        const x = this.externalSquareSize / (tanAngle + 1);
        const y = this.externalSquareSize * tanAngle / (tanAngle + 1);
        const xSpacing = x / nLayer;
        const ySpacing = y / nLayer;

        const sideProps = { x, y, xSpacing, ySpacing, nLayer };
        
        for(let i=0; i < nLayer; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(...this.getPoint({ side, index: i, ...sideProps}));
            this.ctx.lineTo(...this.getPoint({side: nextSide, index: i, ...sideProps}));
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
            yield i;
        }
    }

    *drawLayer(layer) {
        const { color1, color2 } = this.config;
        const colors = [color1, color2];
        const layerAngle = this.layerAngle * layer;

        for(let i=0; i < 4; i++) {
            yield* this.drawSide({ 
                color: colors[(i + layer) % colors.length], 
                side: SIDES[i],
                angle: layerAngle
            });
        }
    }

    *generateStrings() {
        const {layers} =  this.config;
        for(let layer=layers - 1; layer >= 0; layer--) {
            yield* this.drawLayer(layer);
        }
    }

    getStepCount() {
        const { n } = this.config;
        return n * 4 * 6;
    }

    drawNails() {
        const {n} = this.config;

        for(let i=0; i < 4; i++) {
            const side = SIDES[i];
            for (let nail = 0; nail < n; nail++) {
               //this.nails.addNail({ point: this.getPoint({ side, index: nail })})
            }
        }
    }
}

export default Eye;