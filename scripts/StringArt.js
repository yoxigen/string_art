import Nails from "./Nails.js";

const COMMON_CONFIG_CONTROLS = [
    {
        key: 'nailsColor',
        label: 'Nails color',
        defaultValue: "#ffffff",
        type: "color",
    },
    {
        key: 'showNails',
        label: 'Show nails',
        defaultValue: true,
        type: "checkbox",
    },
    {
        key: 'showStrings',
        label: 'Show strings',
        defaultValue: true,
        type: "checkbox",
    },
    {
        key: 'nailRadius',
        label: 'Nail size',
        defaultValue: 3,
        type: "range",
        attr: {
            min: 1,
            max: 20,
            step: 1
        }
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
        this._defaultConfig = this.defaultConfig;
    }

    get defaultConfig() {
        if (!this._defaultConfig) {
            this._defaultConfig = this.configControls.reduce((config, {key, defaultValue}) => ({
                ...config,
                [key]: defaultValue
            }), {});
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

        const [width, height] = this.size = this.getSize([this.canvas.clientWidth, this.canvas.clientHeight]); // [width, height]
        this.width = width;
        this.height = height;
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
        this.center = this.size.map(value => value / 2);

        if (this.nails) {
            this.nails.resetConfig(this.config);
        } else {
            this.nails = new Nails(this.canvas, this.config);
        }
    }

    draw() {
        throw new Error("draw isn't implemented!");
    }
}

export default StringArt;