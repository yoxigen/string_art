import Nails from './Nails.js';

const COLORS = {
  dark: '#0e0e0e',
  light: '#ffffff',
};

const COMMON_CONFIG_CONTROLS = [
  {
    key: 'strings',
    label: 'Strings',
    type: 'group',
    defaultValue: 'minimized',
    children: [
      {
        key: 'showStrings',
        label: 'Show strings',
        defaultValue: true,
        type: 'checkbox',
        isDisabled: ({ showNails }) => !showNails,
      },
      {
        key: 'stringWidth',
        label: 'String width',
        defaultValue: 1,
        type: 'range',
        attr: { min: 0.2, max: 4, step: 0.1 },
        show: ({ showStrings }) => showStrings,
      },
    ],
  },
  {
    key: 'nails',
    label: 'Nails',
    type: 'group',
    defaultValue: 'minimized',
    children: [
      {
        key: 'showNails',
        label: 'Show nails',
        defaultValue: true,
        type: 'checkbox',
        isDisabled: ({ showStrings }) => !showStrings,
      },
      {
        key: 'showNailNumbers',
        label: 'Show nail numbers',
        defaultValue: false,
        type: 'checkbox',
        show: ({ showNails }) => showNails,
      },
      {
        key: 'nailNumbersFontSize',
        label: 'Nail numbers font size',
        defaultValue: 10,
        type: 'range',
        attr: { min: 6, max: 24, step: 0.5 },
        displayValue: ({ nailNumbersFontSize }) => `${nailNumbersFontSize}px`,
        show: ({ showNails, showNailNumbers }) => showNails && showNailNumbers,
      },
      {
        key: 'margin',
        label: 'Margin',
        defaultValue: 20,
        type: 'number',
        attr: { min: 0, max: 500, step: 1 },
        displayValue: ({ margin }) => `${margin}px`,
      },
      {
        key: 'nailRadius',
        label: 'Nail size',
        defaultValue: 1.5,
        type: 'range',
        attr: { min: 0.5, max: 5, step: 0.25 },
        show: ({ showNails }) => showNails,
      },
      {
        key: 'nailsColor',
        label: 'Nails color',
        defaultValue: '#ffffff',
        type: 'color',
        show: ({ showNails }) => showNails,
      },
    ],
  },
  {
    key: 'background',
    label: 'Background',
    type: 'group',
    defaultValue: 'minimized',
    children: [
      {
        key: 'darkMode',
        label: 'Dark mode',
        defaultValue: true,
        type: 'checkbox',
        isDisabled: ({ enableBackground }) => !enableBackground,
      },
      {
        key: 'customBackgroundColor',
        label: 'Custom background color',
        defaultValue: false,
        type: 'checkbox',
        isDisabled: ({ enableBackground }) => !enableBackground,
      },
      {
        key: 'backgroundColor',
        label: 'Background color',
        defaultValue: COLORS.dark,
        type: 'color',
        show: ({ customBackgroundColor }) => customBackgroundColor,
        isDisabled: ({ enableBackground }) => !enableBackground,
      },
      {
        key: 'enableBackground',
        label: 'Enable background',
        defaultValue: true,
        type: 'checkbox',
      },
    ],
  },
];

class StringArt {
  constructor(canvas) {
    if (!canvas) {
      throw new Error('Canvas not specified!');
    }

    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const bsr =
      this.ctx.webkitBackingStorePixelRatio ||
      this.ctx.mozBackingStorePixelRatio ||
      this.ctx.msBackingStorePixelRatio ||
      this.ctx.oBackingStorePixelRatio ||
      this.ctx.backingStorePixelRatio ||
      1;
    this.pixelRatio = dpr / bsr;
  }

  get configControls() {
    return (this.controls ?? []).concat(COMMON_CONFIG_CONTROLS);
  }

  get defaultConfig() {
    if (!this._defaultConfig) {
      this._defaultConfig = Object.freeze(
        Object.assign(flattenConfig(this.configControls), this.defaultValues)
      );
    }

    return this._defaultConfig;
  }

  get config() {
    return this._config ?? this.defaultConfig;
  }

  set config(value) {
    this._config = Object.assign({}, this.defaultConfig, value);
  }

  getSize() {
    const canvasScreenSize = [
      this.canvas.clientWidth,
      this.canvas.clientHeight,
    ];
    return canvasScreenSize.map(v => v * this.pixelRatio);
  }

  setUpDraw() {
    this.canvas.removeAttribute('width');
    this.canvas.removeAttribute('height');
    const [width, height] = (this.size = this.getSize());
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
    const { showNails, showNailNumbers } = this.config;
    if (showNails) {
      this.drawNails();
      this.nails.fill({ drawNumbers: showNailNumbers });
    }
  }

  initDraw() {
    this.setUpDraw(this.config);
    const {
      showNails,
      showNailNumbers,
      darkMode,
      backgroundColor,
      customBackgroundColor,
      enableBackground,
    } = this.config;

    this.ctx.beginPath();
    if (enableBackground) {
      this.ctx.globalCompositeOperation = 'destination-over';
      this.ctx.fillStyle = customBackgroundColor
        ? backgroundColor
        : darkMode
        ? COLORS.dark
        : COLORS.light;
      this.ctx.fillRect(0, 0, ...this.size);
    }

    this.ctx.globalCompositeOperation = 'source-over';
    if (showNails) {
      this.drawNails();
      this.nails.fill({ drawNumbers: showNailNumbers });
    }
  }

  /**
   * Draws the string art on canvas
   * @param { step: number } renderConfig configuration for rendering. Accepts the step to render (leave undefined or null to render all)
   */
  draw({ position = Infinity } = {}) {
    this.initDraw();
    const { showStrings } = this.config;

    if (showStrings) {
      this.stringsIterator = this.generateStrings();
      this.position = 0;

      while (!this.drawNext().done && this.position < position);
      this.afterDraw();
    }
  }

  goto(position) {
    if (position === this.position) {
      return;
    }

    if (this.stringsIterator && position > this.position) {
      while (!this.drawNext().done && this.position < position);
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
    throw new Error('generateStrings method not defined!');
  }

  getStepCount() {
    throw new Error(
      `'getStepCount' method not implemented for string art type "${this.name}"`
    );
  }
}

function flattenConfig(configControls) {
  return configControls.reduce(
    (config, { key, defaultValue, children }) =>
      children
        ? {
            ...config,
            ...flattenConfig(children),
          }
        : {
            ...config,
            [key]: defaultValue,
          },
    {}
  );
}

export default StringArt;
