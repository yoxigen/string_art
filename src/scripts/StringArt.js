import Nails from "./Nails.js";

const COLORS = {
    dark: "#171717",
    light: "#ffffff"
};

const COMMON_CONFIG_CONTROLS = [
    {
        key: 'general',
        label: 'General',
        type: 'group',
        children: [
            {
                key: 'showStrings',
                label: 'Show strings',
                defaultValue: true,
                type: "checkbox",
                isDisabled: ({showNails}) => !showNails
            },
            {
                key: 'stringWidth',
                label: 'String width',
                defaultValue: 1,
                type: "range",
                attr: {
                    min: 0.2,
                    max: 4,
                    step: 0.2
                },
                show: ({showStrings}) => showStrings
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
                    min: 0.5,
                    max: 5,
                    step: 0.25
                },
                show: ({showNails}) => showNails
            },
            {
                key: 'margin',
                label: 'Margin',
                defaultValue: 20,
                type: "number",
                attr: {
                    min: 0,
                    max: 500,
                    step: 1
                }
            }
        ]
    },
    {
        key: 'theme',
        label: 'Theme',
        type: 'group',
        children: [
            {
                key: 'darkMode',
                label: 'Dark mode',
                defaultValue: true,
                type: 'checkbox'
            },
            {
                key: 'customBackgroundColor',
                label: 'Custom background color',
                defaultValue: false,
                type: 'checkbox',
            },
            {
                key: 'backgroundColor',
                label: 'Background color',
                defaultValue: COLORS.dark,
                type: 'color',
                show: ({customBackgroundColor}) => customBackgroundColor
            },
        ]
    }
];

class StringArt {
    constructor(canvas) {
        if (!canvas) {
            throw new Error("Canvas not specified!");
        }

        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        const bsr = this.ctx.webkitBackingStorePixelRatio ||
            this.ctx.mozBackingStorePixelRatio ||
            this.ctx.msBackingStorePixelRatio ||
            this.ctx.oBackingStorePixelRatio ||
            this.ctx.backingStorePixelRatio || 1;
        this.pixelRatio = dpr / bsr;
    }

    get configControls() {
        return (this.controls ?? []).concat(COMMON_CONFIG_CONTROLS);
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

        const canvasScreenSize = [this.canvas.clientWidth, this.canvas.clientHeight];
        const [width, height] = this.size = canvasScreenSize.map(v => v * this.pixelRatio);
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
        this.ctx.lineWidth = this.config.stringWidth;
    }

    afterDraw() {
        if (this.config.showNails) {
            this.drawNails();
            this.nails.fill();
        }
    }

    initDraw() {
        this.setUpDraw(this.config);
        const { showNails, darkMode, backgroundColor, customBackgroundColor } = this.config;

        this.ctx.beginPath();
        this.ctx.globalCompositeOperation = 'destination-over';
        this.ctx.fillStyle = customBackgroundColor ? backgroundColor : darkMode ? COLORS.dark : COLORS.light;
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

    generateStrings() {
        throw new Error("generateStrings method not defined!");
    }

    getStepCount() {
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
