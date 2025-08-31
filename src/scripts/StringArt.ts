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

export type Pattern<TConfig = Record<string, PrimitiveValue>> = new (
  renderer?: Renderer
) => StringArt<TConfig>;

export interface DrawOptions {
  redrawNails?: boolean;
  redrawStrings?: boolean;
  updateSize?: boolean;
}

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
        affectsNails: false,
      },
      {
        key: 'stringWidth',
        label: 'String width',
        defaultValue: 1,
        type: 'range',
        attr: { min: 0.2, max: 4, step: 0.1, snap: '1' },
        show: ({ showStrings }) => showStrings,
        affectsNails: false,
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
        affectsStrings: false,
      },
      {
        key: 'showNailNumbers',
        label: 'Show nail numbers',
        defaultValue: false,
        type: 'checkbox',
        show: ({ showNails }) => showNails,
        affectsStrings: false,
      },
      {
        key: 'nailNumbersFontSize',
        label: 'Nail numbers font size',
        defaultValue: 10,
        type: 'range',
        attr: { min: 6, max: 24, step: 0.5 },
        displayValue: ({ nailNumbersFontSize }) => `${nailNumbersFontSize}px`,
        show: ({ showNails, showNailNumbers }) => showNails && showNailNumbers,
        affectsStrings: false,
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
        attr: { min: 0.5, max: 5, step: 0.25, snap: '1.5' },
        show: ({ showNails }) => showNails,
        affectsStrings: false,
      },
      {
        key: 'nailsColor',
        label: 'Nails color',
        defaultValue: '#ffffff',
        type: 'color',
        show: ({ showNails }) => showNails,
        affectsStrings: false,
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
        affectsNails: false,
      },
      {
        key: 'customBackgroundColor',
        label: 'Custom background color',
        defaultValue: false,
        type: 'checkbox',
        isDisabled: ({ enableBackground }) => !enableBackground,
        affectsNails: false,
      },
      {
        key: 'backgroundColor',
        label: 'Background color',
        defaultValue: COLORS.dark,
        type: 'color',
        show: ({ customBackgroundColor }) => customBackgroundColor,
        isDisabled: ({ enableBackground }) => !enableBackground,
        affectsNails: false,
      },
      {
        key: 'enableBackground',
        label: 'Enable background',
        defaultValue: true,
        type: 'checkbox',
        affectsNails: false,
      },
    ],
  },
];

abstract class StringArt<TConfig = Record<string, PrimitiveValue>> {
  renderer: Renderer | null | undefined;
  controls: ControlsConfig<TConfig> = [];
  defaultValues: Partial<Config<TConfig>> = {};
  stepCount: number | null = null;
  size: Dimensions = null;
  center: Coordinates = null;
  nails: Nails = null;
  position: number = 0;
  stringsIterator: Iterator<void>;

  id: string;
  name: string;
  link: string;
  linkText: string;

  #config: Config<TConfig>;
  #controlsIndex: Record<keyof TConfig, ControlConfig<TConfig>>;
  #defaultConfig: Config<TConfig> | null;

  // TODO: Remove renderer from here, set it only in `draw`. Then StringArt can be instantiated independently of the renderer.
  constructor(renderer?: Renderer) {
    this.renderer = renderer;
  }

  abstract drawNails(): void;
  abstract generateStrings(): Generator<void>;
  abstract getStepCount(): number;

  static thumbnailConfig: Partial<Config>;
  static type: string;

  getCommonControls(): ControlsConfig<Partial<CommonConfig>> {
    return COMMON_CONFIG_CONTROLS;
  }

  get configControls(): ControlsConfig<TConfig> {
    return (this.controls ?? []).concat(this.getCommonControls());
  }

  get controlsIndex(): Record<keyof TConfig, ControlConfig<TConfig>> {
    if (!this.#controlsIndex) {
      this.#controlsIndex = getControlsIndex<TConfig>(this.configControls);
    }

    return this.#controlsIndex;
  }

  get type(): string {
    return (this.constructor as typeof StringArt).type;
  }

  /**
   * A pattern is considered a template if the id is the same as the type. These are built-in patterns.
   */
  get isTemplate(): boolean {
    return this.type === this.id;
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

  set config(value: Partial<Config<TConfig>>) {
    this.#config = Object.assign({}, this.defaultConfig, value);
  }

  /**
   * Assigns the partial config to the current configuration of the StringArt
   * @param config
   */
  assignConfig(config: Partial<Config<TConfig>>) {
    this.#config = Object.assign({}, this.config, config);
  }

  /**
   * Sets the config of the StringArt and updates using `onConfigChange`
   * @param config
   */
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

  /**
   * Child classes can define this method to clear any structural cache when config values for `isStructural=true` controls change.
   */
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

  setConfigValue(controlKey: keyof TConfig, value: PrimitiveValue) {
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
    this.#withRenderer();

    return this.renderer.getSize();
  }

  setUpDraw() {}
  afterDraw() {}

  setSize(size: Dimensions | null, updateRenderer = true): boolean {
    const isReset = size == null;
    if (isReset) {
      size = this.renderer.resetSize();
    } else {
      if (this.size && size[0] === this.size[0] && size[1] === this.size[1]) {
        return false;
      }

      if (updateRenderer) {
        size = this.renderer.setSize(size);
      }
    }

    this.size = size;
    this.center = size.map(value => value / 2) as Coordinates;

    this.onResize();
    return true;
  }

  #updateSize() {
    this.#withRenderer();

    const newSize = this.renderer.resetSize();
    const sizeChanged = this.setSize(newSize, false);

    if (sizeChanged) {
      if (this.onResize) {
        this.onResize();
      }
    }
  }

  initDraw({
    redrawNails = true,
    redrawStrings = true,
    updateSize = true,
  }: DrawOptions = {}) {
    this.#withRenderer();

    if (redrawStrings) {
      this.renderer.resetStrings();
    }

    if (redrawNails) {
      this.renderer.resetNails();
    }

    if (updateSize || !this.size) {
      this.#updateSize();
    }

    if (this.nails) {
      this.nails.setConfig(this.config);
    } else {
      this.nails = new Nails(this.config);
    }

    this.renderer.setLineWidth(this.config.stringWidth);

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

    if (showNails && redrawNails !== false) {
      this.drawNails();
      this.nails.draw(this.renderer, { drawNumbers: showNailNumbers });
    }
  }

  /**
   * Draws the string art
   * @param { step: number } renderConfig configuration for rendering. Accepts the step to render (leave undefined or null to render all)
   */
  draw({
    position = Infinity,
    ...drawOptions
  }: { position?: number } & DrawOptions = {}) {
    this.#withRenderer();

    this.initDraw(drawOptions);
    if (drawOptions.redrawStrings !== false) {
      const { showStrings } = this.config;

      if (showStrings) {
        this.stringsIterator = this.generateStrings();
        this.position = 0;

        while (!this.drawNext().done && this.position < position);
        this.afterDraw();
      }
    }
  }

  goto(position: number) {
    if (position === this.position) {
      return;
    }

    if (this.stringsIterator && position > this.position) {
      while (!this.drawNext().done && this.position < position);
    } else {
      this.draw({ position, updateSize: false });
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

  #withRenderer(): asserts this is { renderer: Renderer } {
    if (!this.renderer) {
      throw new Error('Missing renderer for StringArt!');
    }
  }
}

export default StringArt;
