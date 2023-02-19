import Nails from './Nails.js';
import Renderer from './renderers/Renderer.js';

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
  constructor(renderer) {
    if (!renderer) {
      throw new Error('Renderer not specified!');
    }

    if (!(renderer instanceof Renderer)) {
      throw new Error('Renderer is not an instance of Renderer!');
    }

    this.renderer = renderer;
  }

  get configControls() {
    return (this.controls ?? []).concat(COMMON_CONFIG_CONTROLS);
  }

  get controlsIndex() {
    if (!this._controlsIndex) {
      this._controlsIndex = getControlsIndex(this.controls);
    }

    return this._controlsIndex;
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

  setConfig(config) {
    const currentConfig = this.config;
    this.config = config;
    if (this.onConfigChange) {
      const changedControlKeys = Object.keys(currentConfig).filter(
        key => config[key] !== currentConfig[key]
      );

      this.onConfigChange({
        controls: changedControlKeys.map(key => ({
          control: this.controlsIndex[key],
          value: config[key],
        })),
      });
    }
  }

  setConfigValue(controlKey, value) {
    this._config = Object.freeze({
      ...(this._config ?? this.defaultConfig),
      [controlKey]: value,
    });

    if (this.onConfigChange) {
      this.onConfigChange({
        controls: [{ control: this.controlsIndex[controlKey], value }].filter(
          ({ control }) => !!control
        ),
      });
    }
  }

  getSize() {
    return this.renderer.getSize();
  }

  setUpDraw() {
    const previousSize = this.size;
    this.renderer.reset();
    const [width, height] = (this.size = this.getSize());
    Object.assign(this, this.size);
    this.center = this.size.map(value => value / 2);

    if (
      previousSize &&
      (previousSize[0] !== width || previousSize[1] !== height)
    ) {
      if (this.onResize) {
        this.onResize();
      }
    }

    if (this.nails) {
      this.nails.setConfig(this.config);
    } else {
      this.nails = new Nails(this.renderer, this.config);
    }

    this.renderer.setLineWidth(this.config.stringWidth);
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

    if (enableBackground) {
      this.renderer.setBackground(
        customBackgroundColor
          ? backgroundColor
          : darkMode
          ? COLORS.dark
          : COLORS.light
      );
    }

    if (showNails) {
      this.drawNails();
      this.nails.fill({ drawNumbers: showNailNumbers });
    }
  }

  /**
   * Draws the string art
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

function getControlsIndex(configControls) {
  return configControls.reduce(
    (controlsIndex, control) =>
      control.children
        ? {
            ...controlsIndex,
            ...getControlsIndex(control.children),
          }
        : {
            ...controlsIndex,
            [control.key]: control,
          },
    {}
  );
}

export default StringArt;
