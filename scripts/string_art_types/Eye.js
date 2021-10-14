import StringArt from "../StringArt.js";

const MARGIN = 20;
const SIDES = ['left', 'bottom', 'right', 'top'];
const SIDES_ORDER = ['left', 'bottom', 'right', 'top'];

const SIDES_ROTATION = {
    left: 0,
    bottom: Math.PI / 2,
    right: Math.PI,
    top: Math.PI * 1.5
};

class Eye extends StringArt{
    constructor(canvas) {
        super({
            name: "Eye",
            id: 'eye',
            link: "https://www.etsy.com/listing/489853161/rose-of-space-string-art-sacred-geometry?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=string+art&ref=sr_gallery_1&epik=dj0yJnU9WXNpM1BDTnNkLVBtcWdCa3AxN1J5QUZRY1FlbkJ5Z18mcD0wJm49ZXdJb2JXZmVpNVVwN1NKQ3lXMy10ZyZ0PUFBQUFBR0ZuUzZv",
            configControls: [
                {
                    key: 'n',
                    label: 'Number of nails per side',
                    defaultValue: 82,
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
                    defaultValue: 12,
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
                    defaultValue: 45,
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
                    defaultValue: "#b51243",
                    type: "color",
                },
                {
                    key: 'color2',
                    label: 'String #2 color',
                    defaultValue: "#402060",
                    type: "color",
                },
            ],
            canvas
        })
    }

    setUpDraw() {
        super.setUpDraw();

        const { n, angle } = this.config;

        this.maxSize = Math.min(...this.size) - 2 * MARGIN;
        this.nailSpacing = this.maxSize / (n - 1);
        this.layerAngle = angle * Math.PI / 180;
    }

    // Sides: top, right, bottom, left
    getPoint({index, size, angle, layerStart, rotation}) {
        const theta = angle + rotation;

        const point = { 
            x: layerStart.x, 
            y: layerStart.y + this.nailSpacing * index
        };

        const pivot = { x: this.center[0], y: this.center[1] };

        const cosAngle = Math.cos(theta);
        const sinAngle = Math.sin(theta);

        const position = [
            (cosAngle * (point.x - pivot.x) - sinAngle * (point.y - pivot.y) + pivot.x),
            (sinAngle * (point.x - pivot.x) + cosAngle * (point.y - pivot.y) + pivot.y),
        ];
        return position;
    }

    *drawSide({ side, color = '#ffffff', angle, size, layerStart }) {
        const sideIndex = SIDES.indexOf(side);
        const nextSide = SIDES[sideIndex === SIDES.length - 1 ? 0 : sideIndex + 1];
        const rotation = SIDES_ROTATION[side];
        const nextSideRotation = SIDES_ROTATION[nextSide];
        const nLayer = Math.floor(size / this.nailSpacing);
        
        const sideProps = { nLayer, size, layerStart, angle };
        
        for(let i=0; i < nLayer; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(...this.getPoint({ side, index: i, rotation, ...sideProps}));
            this.ctx.lineTo(...this.getPoint({side: nextSide, index: i, rotation: nextSideRotation, ...sideProps}));
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
            yield i;
        }
    }

    *drawLayer(layer) {
        const { color1, color2 } = this.config;
        const colors = [color2, color1, color2, color1];
        const layerAngle = this.layerAngle * layer;
        const layerSize = this.maxSize / Math.pow(Math.cos(this.layerAngle) + Math.sin(this.layerAngle), layer);
        const layerStart = { 
            x: this.center[0] - layerSize / 2, 
            y: this.center[1] - layerSize / 2
        };

        for (let i = 0; i < SIDES.length; i++) {
            yield* this.drawSide({ 
                color: colors[i], 
                side: SIDES_ORDER[i],
                angle: layerAngle,
                size: layerSize,
                layerStart,
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
        let count = 0;
        const {layers, angle, n} = this.config;
        const layerAngle = angle * Math.PI / 180;
        const maxSize = Math.min(this.canvas.clientWidth, this.canvas.clientHeight) - 2 * MARGIN;
        const nailSpacing = maxSize / (n - 1);

        for(let layer = 0; layer < layers; layer++) {
            const layerSize = maxSize / Math.pow(Math.cos(layerAngle) + Math.sin(layerAngle), layer);
            count += 4 * Math.floor(layerSize / nailSpacing)
        }

        return count;
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