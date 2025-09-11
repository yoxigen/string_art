import {
  getConfigDefaultValues,
  getControlsIndex,
} from './helpers/config_utils';
import { areDimensionsEqual } from './helpers/size_utils';
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
import { CalcOptions } from './types/stringart.types';

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
        isStructural: true,
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
        affectsNails: false,
      },
      {
        key: 'customBackgroundColor',
        label: 'Custom background color',
        defaultValue: false,
        type: 'checkbox',
        affectsNails: false,
      },
      {
        key: 'backgroundColor',
        label: 'Background color',
        defaultValue: COLORS.dark,
        type: 'color',
        show: ({ customBackgroundColor }) => customBackgroundColor,
        affectsNails: false,
      },
    ],
  },
];

abstract class StringArt<TConfig = Record<string, PrimitiveValue>> {
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

  constructor() {}

  abstract drawNails(): void;
  abstract drawStrings(renderer: Renderer): Generator<void>;
  abstract getStepCount(options: CalcOptions): number;
  abstract getAspectRatio(options: CalcOptions): number;

  thumbnailConfig:
    | Partial<Config<TConfig>>
    | ((config: Config<TConfig>) => Partial<Config<TConfig>>);
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
    return this.size;
  }

  setUpDraw(options?: CalcOptions) {}
  afterDraw() {}

  setSize(size: Dimensions): void {
    const sizeChanged = this.size && !areDimensionsEqual(size, this.size);
    this.size = size;
    this.center = size.map(v => v / 2) as Coordinates;

    if (sizeChanged) {
      this.onResize();
    }
  }

  /**
   * Sets up the pattern for rendering, by:
   * 1. Clearing strings and nails from the renderer (if required for any of them)
   * 2. Creates the Nails object
   * 3. Sets the strings line width
   * 4. Calls the pattern's `setUpDraw` method.
   * @param renderer
   * @param param1
   */
  initDraw(
    renderer: Renderer,
    { redrawNails = true, redrawStrings = true }: DrawOptions = {}
  ) {
    this.setSize(renderer.getSize());

    if (redrawStrings) {
      renderer.resetStrings();
    }

    if (redrawNails) {
      renderer.resetNails();
    }

    if (this.nails) {
      this.nails.setConfig(this.config);
    } else {
      this.nails = new Nails(this.config);
    }

    renderer.setLineWidth(this.config.stringWidth);

    this.setUpDraw({ size: this.size });
  }

  /**
   * Draws the string art on the renderer
   */
  draw(
    renderer: Renderer,
    {
      position = Infinity,
      ...drawOptions
    }: { position?: number } & DrawOptions = {}
  ) {
    this.initDraw(renderer, drawOptions);

    const {
      showNails,
      showNailNumbers,
      darkMode,
      backgroundColor,
      customBackgroundColor,
      enableBackground,
    } = this.config;

    if (enableBackground !== false) {
      renderer.setBackground(
        customBackgroundColor
          ? backgroundColor
          : darkMode
          ? COLORS.dark
          : COLORS.light
      );
    }

    if (showNails && drawOptions.redrawNails !== false) {
      this.drawNails();
      this.nails.draw(renderer, { drawNumbers: showNailNumbers });
    }

    if (drawOptions.redrawStrings !== false) {
      const { showStrings } = this.config;

      if (showStrings) {
        this.stringsIterator = this.drawStrings(renderer);
        this.position = 0;

        while (!this.drawNext().done && this.position < position);
        this.afterDraw();
      }
    }
  }

  goto(renderer: Renderer, position: number) {
    if (position === this.position) {
      return;
    }

    if (this.stringsIterator && position > this.position) {
      while (!this.drawNext().done && this.position < position);
    } else {
      this.draw(renderer, { position, redrawNails: false });
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

  copy(): StringArt<TConfig> {
    const config = this.config;
    // @ts-ignore
    const patternCopy = new this.constructor();
    patternCopy.config = config;
    return patternCopy;
  }
}

export default StringArt;
