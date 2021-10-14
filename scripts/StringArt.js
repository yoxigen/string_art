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

    setUpDraw() {
        this.canvas.removeAttribute('width');
        this.canvas.removeAttribute('height');

        const dpr = window.devicePixelRatio || 1;
        const bsr = this.ctx.webkitBackingStorePixelRatio ||
            this.ctx.mozBackingStorePixelRatio ||
            this.ctx.msBackingStorePixelRatio ||
            this.ctx.oBackingStorePixelRatio ||
            this.ctx.backingStorePixelRatio || 1;
        const pixelRatio = dpr / bsr;
        const canvasScreenSize = [this.canvas.clientWidth, this.canvas.clientHeight];
        const [width, height] = this.size = canvasScreenSize.map(v => v * pixelRatio);
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
    }

    initDraw() {
        this.setUpDraw(this.config);
        const { showNails } = this.config;

        this.ctx.beginPath();
        this.ctx.globalCompositeOperation = 'destination-over';
        this.ctx.fillStyle = this.config.darkMode ? '#222222' : '#ffffff';
        this.ctx.fillRect(0, 0, ...this.size);

        this.ctx.globalCompositeOperation = 'source-over';
        if (showNails) {
            this.drawNails();
            this.nails.fill();
        }
    }

    /**
     * Draws the string art on canvas
     * @param { step: number } renderConfig configuration for rendering. Accepts the step to render (leave undefined or null to render all)
     */
    draw({position = Infinity} = {}) {
        this.initDraw();
        const { showStrings } = this.config;

        if (showStrings) {
            this.stringsIterator = this.generateStrings();
            this.position = 0;

            while(!this.drawNext().done && this.position < position);
            this.afterDraw();
        }
    }

    goto(position) {
        if (position === this.position) {
            return;
        }

        if (this.stringsIterator && position > this.position) {
            while(!this.drawNext().done && this.position < position);
            this.afterDraw();
        } else {
            this.draw({ position });
        }
    }

    drawNext() {
        const result = this.stringsIterator.next();

        if (result.done) {
            this.afterDraw();
        } else {
            this.position++;
        }

        return result;
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
