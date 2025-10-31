import {
  getConfigDefaultValues,
  getControlsIndex,
} from '../helpers/config_utils';
import EventBus from '../helpers/EventBus';
import { compareObjects } from '../helpers/object_utils';
import Nails from './nails/Nails';
import { MeasureRenderer, ThreadsLength } from './renderers/MeasureRenderer';
import Renderer from './renderers/Renderer';
import type {
  CommonConfig,
  Config,
  ControlConfig,
  ControlsConfig,
  PrimitiveValue,
} from '../types/config.types';
import { Dimensions } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';
import INails from './nails/INails';

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
  sizeChanged?: boolean;
  enableScheduler?: boolean;
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
        affectsStrings: false,
      },
      {
        key: 'customBackgroundColor',
        label: 'Custom background color',
        defaultValue: false,
        type: 'checkbox',
        affectsNails: false,
        affectsStrings: false,
      },
      {
        key: 'backgroundColor',
        label: 'Background color',
        defaultValue: COLORS.dark,
        type: 'color',
        show: ({ customBackgroundColor }) => customBackgroundColor,
        affectsNails: false,
        affectsStrings: false,
      },
    ],
  },
];

abstract class StringArt<
  TConfig = Record<string, PrimitiveValue>,
  TCalc = Record<string, any>
> extends EventBus<{
  drawdone: void;
}> {
  controls: ControlsConfig<TConfig> = [];
  defaultValues: Partial<Config<TConfig>> = {};
  stepCount: number | null = null;
  size: Dimensions = null;
  position: number = 0;
  stringsIterator: Iterator<void>;

  id: string;
  name: string;
  link: string;
  linkText: string;

  protected calc: TCalc;

  #config: Config<TConfig>;
  #controlsIndex: Record<keyof TConfig, ControlConfig<TConfig>>;
  #defaultConfig: Config<TConfig> | null;
  #controller: TaskController;

  constructor() {
    super();
  }

  abstract drawNails(nails: INails): void;
  abstract drawStrings(renderer: Renderer): Generator<void>;
  abstract getStepCount(options: CalcOptions): number;
  abstract getAspectRatio(options: CalcOptions): number;

  getNailCount(size: Dimensions): number {
    const renderer = new MeasureRenderer(size);
    this.draw(renderer);
    return renderer.nailCount;
  }

  getThreadLengths(size: Dimensions): ThreadsLength {
    const renderer = new MeasureRenderer(size);
    this.draw(renderer);
    return renderer.threadsLength;
  }

  thumbnailConfig:
    | Partial<Config<TConfig>>
    | ((config: Config<TConfig>) => Partial<Config<TConfig>>);
  /**
   * Set testStepCountConfig to automatically test that the step count is correct for the given configurations
   */
  testStepCountConfig: Partial<Config<TConfig>>[];

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

  get isDefaultConfig(): boolean {
    return compareObjects(this.config, this.#defaultConfig);
  }

  /**
   * Marks the current config as default. Useful for saved patterns
   */
  markConfigAsDefault() {
    this.#defaultConfig = this.config;
  }

  resetDefaultConfig() {
    this.#defaultConfig = null;
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
  resetStructure() {
    this.calc = null;
  }

  /**
   * Base method for getCalc
   * @param options
   * @returns
   */
  getCalc(options: CalcOptions): TCalc {
    return {} as TCalc;
  }

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

  setUpDraw(options?: CalcOptions) {
    if (!this.calc) {
      this.calc = this.getCalc(options);
    }
  }

  afterDraw() {
    this.emit('drawdone', null);
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
    { redrawNails = true, redrawStrings = true, sizeChanged }: DrawOptions = {}
  ) {
    if (sizeChanged) {
      this.resetStructure();
    }

    if (redrawStrings) {
      renderer.resetStrings();
    }

    if (redrawNails) {
      renderer.resetNails();
    }

    renderer.clearInstructions();
    renderer.setLineWidth(this.config.stringWidth);

    const size = renderer.getSize();
    this.setUpDraw({ size });
  }

  draw(
    renderer: Renderer,
    options: { position?: number } & DrawOptions = {}
  ): () => void {
    if (!options.enableScheduler) {
      this.#draw(renderer, options);
      return () => {};
    }

    if (this.#controller && !this.#controller.signal.aborted) {
      this.#controller.abort('Redraw');
    }

    this.#controller = new TaskController({ priority: 'background' });
    scheduler
      .postTask(() => this.#draw(renderer, options), {
        signal: this.#controller.signal,
      })
      .catch(reason => {
        // The controller was aborted
      });

    return () => {
      this.#controller?.abort('Cancelled');
    };
  }

  /**
   * Draws the string art on the renderer
   */
  #draw(
    renderer: Renderer,
    { position, ...drawOptions }: { position?: number } & DrawOptions = {}
  ): () => void {
    this.initDraw(renderer, drawOptions);

    const {
      showNails,
      darkMode,
      backgroundColor,
      customBackgroundColor,
      enableBackground,
    } = this.config;

    renderer.setBackground(
      enableBackground !== false
        ? customBackgroundColor
          ? backgroundColor
          : darkMode
          ? COLORS.dark
          : COLORS.light
        : null
    );

    if (showNails && drawOptions.redrawNails !== false) {
      const nails = new Nails({
        color: this.config.nailsColor,
        fontSize: this.config.nailNumbersFontSize,
        radius: this.config.nailRadius,
        renderNumbers: this.config.showNailNumbers,
      });

      this.drawNails(nails);
      nails.draw(renderer);
    }

    if (drawOptions.redrawStrings !== false && this.config.showStrings) {
      this.stringsIterator = this.drawStrings(renderer);
      this.position = 0;

      while (
        !this.drawNext().done &&
        (position == null || this.position < position)
      );
    }

    return () => {
      this.#controller?.abort('Cancelled');
    };
  }

  goto(renderer: Renderer, position: number, { showInstructions = true } = {}) {
    if (position === this.position) {
      return;
    }

    if (this.stringsIterator && position > this.position) {
      while (!this.drawNext().done && this.position < position);
    } else {
      this.draw(renderer, {
        position,
        redrawNails: false,
      });
    }

    if (showInstructions) {
      renderer.renderInstructionsForLastLine();
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

  copy(overrideConfig?: Partial<TConfig>): StringArt<TConfig> {
    // @ts-ignore
    const patternCopy = new this.constructor();
    patternCopy.config = { ...this.config, overrideConfig };
    return patternCopy;
  }
}

export default StringArt;
