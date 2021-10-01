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
                key: 'nailsColor',
                label: 'Nails color',
                defaultValue: "#ffffff",
                type: "color",
                show: ({showNails}) => showNails
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
            }
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
    }

    afterDraw() {
        if (!this.contextBackground) {
            this.contextBackground = this.canvas.getContext("2d");
        }

        this.contextBackground.globalCompositeOperation = 'destination-over';
        this.contextBackground.fillStyle = this.config.darkMode ? '#222222' : '#ffffff';
        this.contextBackground.fillRect(0, 0, ...this.size);
    }

    draw() {
        this.setUpDraw(this.config);
        this.render(this.config);
        this.afterDraw(this.config);
    }

    render(config) {
        throw new Error("render method not defined!");
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