import StringArt from "../StringArt.js";
import Circle from "./Circle.js";

export default class Circles extends StringArt {
    name = "Circles";
    id = "circles";
    link = "https://www.etsy.com/il-en/listing/1018950430/calming-wall-art-in-light-blue-for";
    controls = [
        {
            key: 'n',
            label: 'Circle nails',
            defaultValue: 80,
            type: 'range',
            attr: {
                min: 1,
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
                            key: 'radius1',
                            label: 'Radius',
                            defaultValue: 0.5,
                            type: 'range',
                            attr: {
                                min: 0.01,
                                max: 1,
                                step: 0.01
                            },
                            show: ({show1}) => show1,
                        },
                        {
                            key: 'x1',
                            label: 'Position X',
                            defaultValue: 0.5,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({show1}) => show1,
                        },
                        {
                            key: 'y1',
                            label: 'Position Y',
                            defaultValue: 0,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({show1}) => show1,
                        },
                        {
                            ...Circle.rotationConfig,
                            key: 'rotation1',
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
                            key: 'radius2',
                            label: 'Radius',
                            defaultValue: 0.5,
                            type: 'range',
                            attr: {
                                min: 0.01,
                                max: 1,
                                step: 0.01
                            },
                            show: ({show2}) => show2,
                        },
                        {
                            key: 'x2',
                            label: 'Position X',
                            defaultValue: 0,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({show2}) => show2,
                        },
                        {
                            key: 'y2',
                            label: 'Position Y',
                            defaultValue: 1,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({show2}) => show2,
                        },
                        {
                            ...Circle.rotationConfig,
                            key: 'rotation2',
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
                            key: 'radius3',
                            label: 'Radius',
                            defaultValue: 0.5,
                            type: 'range',
                            attr: {
                                min: 0.01,
                                max: 1,
                                step: 0.01
                            },
                            show: ({show3}) => show3,
                        },
                        {
                            key: 'x3',
                            label: 'Position X',
                            defaultValue: 1,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({show3}) => show3,
                        },
                        {
                            key: 'y3',
                            label: 'Position Y',
                            defaultValue: 1,
                            type: 'range',
                            attr: {
                                min: 0,
                                max: 1,
                                step: 0.01
                            },
                            show: ({show3}) => show3,
                        },
                        {
                            ...Circle.rotationConfig,
                            key: 'rotation3',
                            show: ({show3}) => show3,
                        },
                        {
                            key: 'color3',
                            label: 'Color',
                            defaultValue: "#ec6ad0",
                            type: "color",
                            show: ({show3}) => show3,
                        },
                        {
                            key: 'reverse3',
                            label: 'Reverse',
                            defaultValue: false,
                            type: 'checkbox',
                            show: ({show3}) => show3
                        },
                    ]
                }
            ]
        }
    ];

    setUpDraw() {
        super.setUpDraw();
        Object.assign(this, this.getSetUp());
    }

    getSetUp() {
        const { n, margin = 0 } = this.config;
        const size = this.getSize();

        const maxRadius = Math.min(...size.map(v => v - 2 * margin)) / 2;
        const layers = new Array(3).fill(null)
            .map((_, i) => getLayer.call(this, i + 1))
            .filter(({enable}) => enable)

        return {
            layers,
        };

        function getLayer(layerIndex) {
            const prop = prop => this.config[prop + layerIndex];
            
            const props = {
                color: prop('color'),
                enable: prop('show'),
                isReverse: prop('reverse'),
                position: [prop('x'), prop('y')],
                radius: maxRadius * prop('radius'),
                rotation: prop('rotation')
            };


            const circle = new Circle({
                radius: props.radius,
                center: props.position.map((v, i) => props.radius + margin + (size[i] - (props.radius + margin) * 2) * v),
                n,
                rotation: props.rotation,
                reverse: props.isReverse,
            });

            return {
                circle,
                ...props
            };
        }
    }

    *generateStrings() {
        const {n, color1} = this.config;

        this.ctx.strokeStyle = color1;
        let prevCirclePoint;

        for (let i = 0; i < n; i++) {
            for(let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
                const {circle} = this.layers[layerIndex];
                this.ctx.beginPath();
                this.ctx.moveTo(...(prevCirclePoint ?? circle.getPoint(i)));

                if (layerIndex === 0 && i) {
                    this.ctx.lineTo(...circle.getPoint(i));
                }

                let nextLayerIndex = layerIndex + 1;
                if (nextLayerIndex === this.layers.length) {
                    nextLayerIndex = 0;
                }

                prevCirclePoint = this.layers[nextLayerIndex].circle.getPoint(i);
                this.ctx.lineTo(...prevCirclePoint)
                this.ctx.stroke();
                yield;
            }
        }
        
    }

    drawNails() {
        const n = this.config;
        this.layers.forEach(({circle}, layerIndex) => circle.drawNails(this.nails, { 
            getNumber: i => `${layerIndex + 1}_${i + 1}` 
        }));
    }

    getStepCount() {
        const {n} = this.config;
        const {layers} = this.getSetUp();
        return layers.length * n - 1;
    }
}
