class StringArt {
    constructor({ configControls, id, name, link, canvas }) {
        if (!canvas) {
            throw new Error("Canvas not specified!");
        }

        this.configControls = configControls;
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

    draw() {
        this.canvas.removeAttribute('width');
        this.canvas.removeAttribute('height');
        this.canvas.removeAttribute('style');

        const [width, height] = this.size = this.getSize([this.canvas.clientWidth, this.canvas.clientHeight]); // [width, height]
        this.width = width;
        this.height = height;
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.center = this.size.map(value => value / 2);

        if (this.beforeDraw) {
            this.beforeDraw();
        }

        if (this.config.showShape !== false) {
            this.drawShape(this.config);
        }
        
        this.drawStrings(this.config);
    }

    drawShape(config) {
        throw new Error("drawShape isn't implemented!");
    }

    drawStrings(config) {
        throw new Error("drawStrings isn't implemented!");
    }
}

export default StringArt;