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
  Config,
  ControlConfig,
  ControlsConfig,
  PrimitiveValue,
} from '../types/config.types';
import { Dimensions } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';
import Controller from './Controller';
import NailsSetter from './nails/NailsSetter';
import { DEFAULT_COLORS } from '../helpers/color/default_colors';
import { COMMON_CONFIG_CONTROLS } from './common_controls';

export type Pattern<TConfig = Record<string, PrimitiveValue>> = new (
  renderer?: Renderer
) => StringArt<TConfig>;

export interface DrawOptions {
  redrawNails?: boolean;
  redrawStrings?: boolean;
  sizeChanged?: boolean;
  enableScheduler?: boolean;
  precision?: number;
}

abstract class StringArt<
  TConfig = Record<string, PrimitiveValue>,
  TCalc = Record<string, any>
> extends EventBus<{
  drawdone: void;
}> {
  abstract controls: ControlsConfig<TConfig>;
  abstract id: string;
  abstract name: string;
  link: string;
  linkText: string;

  defaultValues: Partial<Config<TConfig>> = {};
  stepCount: number | null = null;
  position: number = 0;

  protected calc: TCalc;

  private stringsIterator: Iterator<void>;
  private nails: Nails;
  private controller: Controller;

  #config: Config<TConfig>;
  #controlsIndex: Record<keyof TConfig, ControlConfig<TConfig>>;
  #defaultConfig: Readonly<Config<TConfig>> | null;
  #taskController: TaskController;

  constructor() {
    super();
  }

  abstract drawNails(nails: NailsSetter): void;
  abstract drawStrings(controller: Controller): Generator<void>;
  abstract getStepCount(options: CalcOptions): number;
  abstract getAspectRatio(options: CalcOptions): number;

  /**
   * Can be implemented in extending classes for a more efficient implementation. This is just a fallback
   * @param size
   * @param precision
   * @returns
   */
  getNailCount(size: Dimensions, precision?: number): number {
    const renderer = new MeasureRenderer(size);
    this.draw(renderer, { precision });
    return renderer.nailCount;
  }

  thumbnailConfig:
    | Partial<Config<TConfig>>
    | ((config: Config<TConfig>) => Partial<Config<TConfig>>);
  /**
   * Set testStepCountConfig to automatically test that the step count is correct for the given configurations
   */
  testStepCountConfig: Partial<Config<TConfig>>[];

  static type: string;

  get configControls(): ControlsConfig<TConfig> {
    return (this.controls ?? []).concat(COMMON_CONFIG_CONTROLS);
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
      this.#defaultConfig = Object.assign(
        getConfigDefaultValues(this.configControls),
        this.defaultValues
      ) as Config<TConfig>;
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
    this.nails = null;
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

    this.#config = {
      ...(this.#config ?? this.defaultConfig),
      [controlKey]: value,
    };

    if (this.onConfigChange) {
      this.onConfigChange(
        [{ control: this.controlsIndex[controlKey], value }].filter(
          ({ control }) => !!control
        )
      );
    }
  }

  setUpDraw({ precision, ...options }: CalcOptions & { precision?: number }) {
    if (!this.calc) {
      this.calc = this.getCalc(options);
    }

    if (!this.nails) {
      this.nails = new Nails({ precision });
      this.drawNails(this.nails);
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
    {
      redrawNails = true,
      redrawStrings = true,
      sizeChanged,
      precision,
    }: DrawOptions = {}
  ) {
    if (sizeChanged) {
      this.resetStructure();
    }

    if (redrawStrings) {
      renderer.resetStrings();
    }

    if (redrawNails) {
      this.nails = null;
      renderer.resetNails();
    }

    renderer.clearInstructions();
    renderer.setLineWidth(this.config.stringWidth);

    const size = renderer.getSize();
    this.setUpDraw({ size, precision });
  }

  draw(
    renderer: Renderer,
    options: { position?: number } & DrawOptions = {}
  ): () => void {
    if (!options.enableScheduler) {
      this.#draw(renderer, options);
      return () => {};
    }

    if (this.#taskController && !this.#taskController.signal.aborted) {
      this.#taskController.abort('Redraw');
    }

    this.#taskController = new TaskController({ priority: 'background' });
    scheduler
      .postTask(() => this.#draw(renderer, options), {
        signal: this.#taskController.signal,
      })
      .catch(reason => {
        // The controller was aborted
      });

    return () => {
      this.#taskController?.abort('Cancelled');
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
          ? DEFAULT_COLORS.dark
          : DEFAULT_COLORS.light
        : null
    );

    if (showNails && drawOptions.redrawNails !== false) {
      this.nails.draw(renderer, {
        color: this.config.nailsColor,
        fontSize: this.config.nailNumbersFontSize,
        radius: this.config.nailRadius,
        renderNumbers: this.config.showNailNumbers,
      });
    }

    this.controller = new Controller(renderer, this.nails);

    if (drawOptions.redrawStrings !== false && this.config.showStrings) {
      this.stringsIterator = this.drawStrings(this.controller);
      this.position = 0;

      while (
        !this.drawNext().done &&
        (position == null || this.position < position)
      );
    }

    return () => {
      this.#taskController?.abort('Cancelled');
    };
  }

  getLastStringNailNumbers(): [number, number] {
    return this.controller.getLastStringNailNumbers();
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
