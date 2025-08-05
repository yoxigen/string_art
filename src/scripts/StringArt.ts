import {
  getConfigDefaultValues,
  getControlsIndex,
} from './helpers/config_utils';
import Nails from './Nails';
import Renderer from './renderers/Renderer';
import type {
  CommonConfig,
  Config,
  ControlConfig,
  ControlsConfig,
  PrimitiveValue,
} from './types/config.types';
import { Coordinates, Dimensions } from './types/general.types';

const COLORS = {
  dark: '#0e0e0e',
  light: '#ffffff',
};

const COMMON_CONFIG_CONTROLS: ControlsConfig = [
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

abstract class StringArt<TConfig = Record<string, PrimitiveValue>> {
  renderer: Renderer;
  controls: ControlsConfig<TConfig>;
  defaultValues: Config<TConfig>;
  stepCount: number = null;
  size: Dimensions = null;
  center: Coordinates = null;
  nails: Nails = null;
  position: number = 0;
  stringsIterator: Iterator<void>;

  #config: Config<TConfig>;
  #controlsIndex: { [key: string]: ControlConfig<TConfig> } | null;
  #defaultConfig: Config<TConfig> | null;

  constructor(renderer: Renderer) {
    if (!renderer) {
      throw new Error('Renderer not specified!');
    }

    if (!(renderer instanceof Renderer)) {
      throw new Error('Renderer is not an instance of Renderer!');
    }

    this.renderer = renderer;
  }

  abstract drawNails(): void;
  abstract generateStrings(): Generator<void>;
  abstract getStepCount(): number;

  getCommonControls(): ControlsConfig<CommonConfig> {
    return COMMON_CONFIG_CONTROLS;
  }

  get configControls(): ControlsConfig<TConfig> {
    return (this.controls ?? []).concat(this.getCommonControls());
  }

  get controlsIndex(): { [key: string]: ControlConfig<TConfig> } {
    if (!this.#controlsIndex) {
      this.#controlsIndex = getControlsIndex<TConfig>(this.controls);
    }

    return this.#controlsIndex;
  }

  get defaultConfig(): Config<TConfig> {
    if (!this.#defaultConfig) {
      this.#defaultConfig = Object.freeze(
        Object.assign(
          getConfigDefaultValues(this.configControls),
          this.defaultValues
        ) as Config<TConfig>
      );
    }

    return this.#defaultConfig;
  }

  get config(): Config<TConfig> {
    return this.#config ?? this.defaultConfig;
  }

  set config(value: Config<TConfig>) {
    this.#config = Object.assign({}, this.defaultConfig, value);
  }

  setConfig(config: Config<TConfig>) {
    const currentConfig = this.config;
    this.config = config;
    if (this.onConfigChange) {
      const changedControlKeys = Object.keys(currentConfig).filter(
        key => config[key] !== currentConfig[key]
      );

      this.onConfigChange(
        changedControlKeys.map(key => ({
          control: this.controlsIndex[key],
          value: config[key],
        }))
      );
    }
  }

  resetStructure() {}

  onConfigChange(
    controls: ReadonlyArray<{
      control: ControlConfig<TConfig>;
      value: PrimitiveValue | null;
    }>
  ) {
    if (controls.some(({ control }) => control.isStructural)) {
      this.resetStructure();
      if (
        this.stepCount != null &&
        controls.some(({ control }) => control.affectsStepCount !== false)
      ) {
        this.stepCount = null;
      }
    }
  }

  onResize() {
    this.resetStructure();
  }

  setConfigValue(controlKey: string, value: PrimitiveValue) {
    if (this.#config && this.#config[controlKey] === value) {
      return;
    }

    this.#config = Object.freeze({
      ...(this.#config ?? this.defaultConfig),
      [controlKey]: value,
    });

    if (this.onConfigChange) {
      this.onConfigChange(
        [{ control: this.controlsIndex[controlKey], value }].filter(
          ({ control }) => !!control
        )
      );
    }
  }

  getSize(): Dimensions {
    return this.renderer.getSize();
  }

  setUpDraw() {
    const previousSize = this.size;
    this.renderer.reset();
    const [width, height] = (this.size = this.getSize());
    Object.assign(this, this.size);
    this.center = this.size.map(value => value / 2) as Coordinates;

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
    this.setUpDraw();
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
  draw({ position = Infinity }: { position?: number } = {}) {
    this.initDraw();
    const { showStrings } = this.config;

    if (showStrings) {
      this.stringsIterator = this.generateStrings();
      this.position = 0;

      while (!this.drawNext().done && this.position < position);
      this.afterDraw();
    }
  }

  goto(position: number) {
    if (position === this.position) {
      return;
    }

    if (this.stringsIterator && position > this.position) {
      while (!this.drawNext().done && this.position < position);
    } else {
      this.draw({ position });
    }
  }

  /**
   *
   * @returns Advance the strings iterator by one. If the iterator is done, calls this.afterDraw().
   */
  drawNext() {
    const result = this.stringsIterator.next();

    if (result.done) {
      this.afterDraw();
    } else {
      this.position++;
    }

    return result;
  }
}

export default StringArt;
