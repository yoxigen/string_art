import Nails from "./Nails.js";

const COMMON_CONFIG_CONTROLS = [
    {
        key: 'general',
        label: 'General',
        type: 'group',
        children: [
            {
                key: 'darkMode',
                label: 'Dark mode',
                defaultValue: true,
                type: 'checkbox'
            },
            {
                key: 'showStrings',
                label: 'Show strings',
                defaultValue: true,
                type: "checkbox",
                isDisabled: ({showNails}) => !showNails
            },
            {
                key: 'showNails',
                label: 'Show nails',
                defaultValue: true,
                type: "checkbox",
                isDisabled: ({showStrings}) => !showStrings
            },
            {
                key: 'nailRadius',
                label: 'Nail size',
                defaultValue: 1,
                type: "range",
                attr: {
                    min: 1,
                    max: 5,
                    step: 1
                },
                show: ({showNails}) => showNails
            },
            // {
            //     key: 'width',
            //     label: 'Width (cm)',
            //     defaultValue: '',
            //     type: 'number',
            //     attr: {
            //         min: 1,
            //         max: 200,
            //         step: 1
            //     }
            // },
            // {
            //     key: 'height',
            //     label: 'Height (cm)',
            //     defaultValue: '',
            //     type: 'number',
            //     attr: {
            //         min: 1,
            //         max: 200,
            //         step: 1
            //     }
            // }
        ]
    },
];

class StringArt {
    constructor({ configControls, id, name, link, canvas }) {
        if (!canvas) {
            throw new Error("Canvas not specified!");
        }

        this.configControls = configControls.concat(COMMON_CONFIG_CONTROLS);
        this.name = name;
        this.id = id;
        this.link = link;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this._defaultConfig = this.defaultConfig;
    }

    get defaultConfig() {
        if (!this._defaultConfig) {
            this._defaultConfig = flattenConfig(this.configControls);
        }

        return this._defaultConfig;
    }

    get config() {
        return this._config ?? this.defaultConfig;
    }

    set config(value) {
        this._config = Object.assign({}, this.defaultConfig, value);
    }

    getSize(size) {
        return size;
    }

    setUpDraw() {
        this.canvas.removeAttribute('width');
        this.canvas.removeAttribute('height');
        this.canvas.removeAttribute('style');

        const [width, height] = this.size = [this.canvas.clientWidth, this.canvas.clientHeight];
        Object.assign(this, this.size);
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
        this.center = this.size.map(value => value / 2);

        if (this.nails) {
            this.nails.setConfig(this.config);
        } else {
            this.nails = new Nails(this.canvas, this.config);
        }

        this.ctx.clearRect(0, 0, ...this.size);
    }

    afterDraw() {
        if (this.config.showNails) {
            this.drawNails();
            this.nails.fill();
        }
        this.positionEnd = true;
    }

    /**
     * Draws the string art on canvas
     * @param { step: number } renderConfig configuration for rendering. Accepts the step to render (leave undefined or null to render all) 
     */
    draw({animate = false, steps = Infinity} = {}) {
        this.setUpDraw(this.config);
        this.positionEnd = false;
        
        const { showNails, showStrings } = this.config;

        this.ctx.beginPath();
        this.ctx.globalCompositeOperation = 'destination-over';
        this.ctx.fillStyle = this.config.darkMode ? '#222222' : '#ffffff';
        this.ctx.fillRect(0, 0, ...this.size);

        this.ctx.globalCompositeOperation = 'source-over';
        
        if (showStrings) {
            this.stringsIterator = this.generateStrings();
            const self = this;

            this.position = 0;

            if (animate) {
                this.play();
            } else {
                while(!this.drawNext().done && this.position++ < steps);
                this.afterDraw();
            }
        }

        if (showNails) {
            this.drawNails();
            this.nails.fill();
        }
    }

    drawNext() {
        const result = this.stringsIterator.next();
        if (result.done) {
            this.afterDraw();
        }
        return result;
    }

    play() {
        if (this.positionEnd) {
            this.draw({ animate: true });
            return;
        }

        const self = this;
        cancelAnimationFrame(this.renderRafId);

        step();
            
        function step() {
            self.position++;
            if (!self.drawNext().done) {
                self.renderRafId = requestAnimationFrame(step);
            }
        }
    }

    pause() {
        cancelAnimationFrame(this.renderRafId);
    }

    generateStrings(config) {
        throw new Error("generateStrings method not defined!");
    }

    getStepCount(config) {
        throw new Error(`'getStepCount' method not implemented for string art type "${this.name}"`);
    }
}

function flattenConfig(configControls) {
    return configControls.reduce((config, {key, defaultValue, children}) =>
        children ? {
            ...config,
            ...flattenConfig(children)
        } : {
            ...config,
            [key]: defaultValue
        },
    {});
}

export default StringArt;