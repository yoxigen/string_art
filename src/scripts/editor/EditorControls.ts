import { ExpandablePanel } from '../components/expandable_panel/ExpandablePanel';
import StringArtCheckbox from '../components/inputs/StringArtCheckbox';
import StringArtHueInput from '../components/inputs/StringArtHueInput';
import StringArtRangeInput from '../components/inputs/StringArtRangeInput';
import { toggleHide, unHide } from '../helpers/dom_utils';
import EventBus from '../helpers/EventBus';
import type {
  Config,
  ConfigValueOrFunction,
  ControlConfig,
  ControlsConfig,
  ControlType,
  PrimitiveValue,
} from '../types/config.types';

const elements = {
  controls: document.querySelector('#controls') as HTMLElement,
  controlsPanel: document.querySelector('#controls_panel') as HTMLElement,
  design: document.querySelector('#design') as HTMLElement,
};

const STATE_LOCAL_STORAGE_KEY = 'controls_state';
const RANGE_SCROLL_LOCK_TIMEOUT = 120;

let inputTimeout: number;

interface EditorState {
  groups: {
    [groupId: string]: boolean;
  };
}

type ControlInputElement = (
  | HTMLInputElement
  | StringArtRangeInput
  | StringArtHueInput
  | StringArtCheckbox
  | HTMLSelectElement
) & {
  updateTimeout?: number;
};

interface Control<TConfig> {
  config: ControlConfig<TConfig>;
  input: ControlInputElement;
  element: HTMLElement;
  displayValueElement: HTMLSpanElement;
  label?: HTMLLabelElement;
}

export type ControlValueChangeEventData<
  TConfig extends Config,
  TControl extends keyof TConfig = keyof TConfig
> = {
  control: ControlConfig<TConfig>;
  value: TConfig[TControl];
  originalEvent: Event;
};

export default class EditorControls<TConfig extends Config> extends EventBus<{
  input: ControlValueChangeEventData<TConfig>;
  change: ControlValueChangeEventData<TConfig>;
}> {
  config: Config<TConfig>;
  controlsConfig: ControlsConfig<TConfig>;
  state: EditorState;
  controlElements: Partial<Record<keyof TConfig, Control<TConfig>>> = {};

  #postponeRangeInput: boolean = false;
  #postponeRangeInputTimeout: number;
  #wrappedOnInput;
  #wrappedOnTouchStart;
  #wrappedOnTouchEnd;
  #wrappedOnRangeScroll;
  #currentInputRange: StringArtRangeInput | StringArtHueInput;
  #currentInputRangeValue: number;
  #rangeLockTimeout: number;
  #lockRange: boolean = false;
  #boundToggleFieldset;

  constructor(
    controlsConfig: ControlsConfig<TConfig>,
    config: Config<TConfig>
  ) {
    super();

    this.config = config;
    this.controlsConfig = controlsConfig;
    this.state = this._getState() ?? { groups: {} };

    this.#wrappedOnInput = this.#onInput.bind(this);
    elements.controls.addEventListener('input', this.#wrappedOnInput);
    this.#wrappedOnTouchStart = this.#onTouchStart.bind(this);
    elements.controls.addEventListener(
      'touchstart',
      this.#wrappedOnTouchStart,
      { passive: true }
    );
    elements.controls.addEventListener('mousedown', this.#onMouseDown);
    this.#boundToggleFieldset = this.#toggleFieldset.bind(this);
    elements.design.addEventListener('click', this.#boundToggleFieldset);
    elements.design.addEventListener('keydown', this.#toggleFieldSetOnEnter);
    this.controlElements = {};
    this.renderControls();

    const menu = document.querySelector('#controls_menu');
    const controlsPanel = document.querySelector('#controls_panel');
    menu.addEventListener('click', e => {
      if (e.target instanceof HTMLElement) {
        const href = e.target
          .closest('.controls_menu_item')
          ?.getAttribute('href');
        e.preventDefault();
        if (href) {
          if (href === '#controls_top') {
            controlsPanel.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          } else {
            const menuTarget = document.querySelector(href);
            if (menuTarget instanceof ExpandablePanel) {
              menuTarget.open();
              menuTarget.scrollIntoView({
                behavior: 'smooth',
              });
            }
          }
        }
      }
    });
  }

  destroy() {
    elements.controls.removeEventListener('input', this.#wrappedOnInput);
    elements.design.removeEventListener('click', this.#boundToggleFieldset);
    elements.design.removeEventListener('keydown', this.#toggleFieldSetOnEnter);
    elements.controls.removeEventListener(
      'touchstart',
      this.#wrappedOnTouchStart
    );
    elements.controls.removeEventListener('mousedown', this.#onMouseDown);
    elements.controls.innerHTML = '';
  }

  #toggleFieldset(this: EditorControls<TConfig>, e) {
    if (e.target.nodeName === 'LEGEND') {
      e.target.parentElement.classList.toggle('minimized');
      const groupId = e.target.parentElement.dataset.group;
      this.state = {
        ...this.state,
        groups: {
          ...this.state.groups,
          [groupId]: !e.target.parentElement.classList.contains('minimized'),
        },
      };
      this._updateState(this.state);
    }
  }

  #toggleFieldSetOnEnter(e) {
    if (e.target.nodeName === 'LEGEND' && e.key === 'Enter') {
      this.#toggleFieldset(e);
    }
  }

  #onMouseDown() {
    // Clearing selection when starting to click in the controls, do avoid a buggy behavior,
    // when if a control's display value was selected (can happen by mistake), the drag of range input doesn't work.
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  }

  /**
   * Needed for range inputs, to avoid changing the value when the user drags to
   * scroll and accidentally touches a range input when intending to scroll.
   * @param {Event} e
   */
  #onTouchStart(e: TouchEvent) {
    if (isRangeInput(e.target)) {
      this.#postponeRangeInput = true;
      this.#currentInputRange = e.target;
      this.#currentInputRangeValue = e.target.value;
      this.#rangeLockTimeout = window.setTimeout(() => {
        this.#postponeRangeInput = false;
      }, RANGE_SCROLL_LOCK_TIMEOUT);
      this.#wrappedOnTouchEnd = this.#onTouchEnd.bind(this);
      document.body.addEventListener('touchend', this.#wrappedOnTouchEnd, {
        passive: true,
      });
      this.#wrappedOnRangeScroll = this.#onRangeScroll.bind(this);
      elements.controlsPanel.addEventListener(
        'scroll',
        this.#wrappedOnRangeScroll
      );
    }
  }

  #onTouchEnd(this: EditorControls<TConfig>) {
    document.body.removeEventListener('touchend', this.#wrappedOnTouchEnd);
    elements.controlsPanel.removeEventListener(
      'scroll',
      this.#wrappedOnRangeScroll
    );

    if (this.#lockRange) {
      this.#lockRange = false;
      if (this.#currentInputRange) {
        this.#currentInputRange.value = this.#currentInputRangeValue;
      }
    }

    this.#currentInputRange = this.#currentInputRangeValue = null;
  }

  #onRangeScroll(this: EditorControls<TConfig>) {
    this.#lockRange = true;
  }

  #onInput(e: InputEvent) {
    clearTimeout(inputTimeout);
    clearTimeout(this.#postponeRangeInputTimeout);

    if (this.#postponeRangeInput && isRangeInput(e.target)) {
      e.preventDefault();
      this.#postponeRangeInputTimeout = window.setTimeout(() => {
        this.#onInput(e);
      }, RANGE_SCROLL_LOCK_TIMEOUT);
      return false;
    }
    if (this.#lockRange) {
      e.preventDefault();
      return false;
    }

    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof StringArtCheckbox ||
      isRangeInput(e.target) ||
      e.target instanceof HTMLSelectElement
    ) {
      this.updateInput({
        inputElement: e.target,
        originalEvent: e,
        deferChange: true,
      });
    }
  }

  updateControlDisplayValue(controlKey: keyof TConfig) {
    const { config, displayValueElement, input } = this.controlElements[
      controlKey
    ] as Control<TConfig>;
    if (displayValueElement) {
      const formattedValue = config.displayValue
        ? config.displayValue(this.config)
        : input.value;
      displayValueElement.innerText = String(formattedValue);
    }
  }

  updateInput({
    inputElement,
    originalEvent,
    deferChange = true,
  }: {
    inputElement: ControlInputElement;
    originalEvent?: InputEvent;
    deferChange?: boolean;
  }) {
    const controlKey = inputElement.id.replace(/^config_/, '') as keyof TConfig;
    const inputValue = getInputValue(
      inputElement
    ) as TConfig[typeof controlKey];

    if (this.config[controlKey] === inputValue) {
      return;
    }

    const eventData: ControlValueChangeEventData<TConfig> = {
      control: this.controlElements[controlKey].config,
      value: inputValue,
      originalEvent,
    };

    this.emit('input', eventData);

    const triggerChange = () => {
      this.emit('change', eventData);
      this.updateControlsVisibility();
      this.updateControlsLabels();
    };

    this.updateControlsAttributes();
    this.updateControlDisplayValue(controlKey);

    if (deferChange) {
      inputTimeout = window.setTimeout(triggerChange, 100);
    } else {
      triggerChange();
    }
  }

  _getState(): EditorState | null {
    const state = localStorage.getItem(STATE_LOCAL_STORAGE_KEY);
    if (state) {
      try {
        return JSON.parse(state);
      } catch (e) {
        return null;
      }
    }

    return null;
  }

  _updateState(newState) {
    if (newState) {
      localStorage.setItem(STATE_LOCAL_STORAGE_KEY, JSON.stringify(newState));
    } else {
      localStorage.removeItem(STATE_LOCAL_STORAGE_KEY);
    }
  }

  updateControlsAttributes(controlsConfig?: ControlsConfig<TConfig>) {
    if (!controlsConfig) {
      controlsConfig = this.controlsConfig;
    }
    controlsConfig.forEach(control => {
      if (control.type === 'group') {
        this.updateControlsAttributes(control.children);
      } else if (control.attr) {
        const functionAttrs = Object.entries(control.attr).filter(
          ([_, value]) => value instanceof Function
        );
        if (functionAttrs.length) {
          const inputEl = this.controlElements[control.key].input;
          if (inputEl) {
            functionAttrs.forEach(([name, attributeValueFn]) => {
              const newAttrValue = this.getConfigValue(
                attributeValueFn,
                this.config
              );
              if (newAttrValue != inputEl.getAttribute(name)) {
                inputEl.setAttribute(name, String(newAttrValue));
                // If the min or max of the input changed and they're not within the new min/max, update the value of the input
                if (
                  (name === 'min' && inputEl.value < newAttrValue) ||
                  (name === 'max' && inputEl.value > newAttrValue)
                ) {
                  inputEl.value = String(newAttrValue);
                  clearTimeout(inputEl.updateTimeout);
                  inputEl.updateTimeout = window.setTimeout(() => {
                    this.updateInput({ inputElement: inputEl });
                  }, 100);
                } else {
                  this.updateControlDisplayValue(control.key);
                }
              }
            });
          }
        }
      }
    });
  }

  updateControlsLabels(controlsConfig?: ControlsConfig<TConfig>) {
    (controlsConfig ?? this.controlsConfig).forEach(control => {
      if (control.label instanceof Function) {
        const { label: labelEl, element } = this.controlElements[control.key];

        const labelText = control.label(this.config);
        if (control.type === 'checkbox') {
          element.setAttribute('label', labelText);
        } else if (control.type === 'group') {
          element.setAttribute('legend', labelText);
        } else if (labelEl) {
          labelEl.innerText = labelText;
        }
      }

      if (control.type === 'group') {
        this.updateControlsLabels(control.children);
      }
    });
  }

  updateControlsVisibility(controlsConfig?: ControlsConfig<TConfig>) {
    (controlsConfig ?? this.controlsConfig).forEach(control => {
      if (control.show) {
        const shouldShowControl = control.show(this.config);
        const controlEl = this.controlElements[control.key].element;
        if (controlEl) {
          toggleHide(controlEl, !shouldShowControl);
        }
      }

      if (control.isDisabled) {
        const shouldDisableControl = control.isDisabled(this.config);
        const inputEl = this.controlElements[control.key].input;
        if (inputEl) {
          if (shouldDisableControl) {
            inputEl.setAttribute('disabled', 'disabled');
          } else {
            inputEl.removeAttribute('disabled');
          }
        }
      }

      if (control.children) {
        this.updateControlsVisibility(control.children);
      }
    });
  }

  renderControls(
    containerEl: HTMLElement | undefined = elements.controls,
    _controlsConfig?: ControlsConfig<TConfig>,
    indexStart?: number
  ) {
    const controlsConfig = _controlsConfig ?? this.controlsConfig;
    containerEl.innerHTML = '';
    const controlsFragment = document.createDocumentFragment();
    indexStart = indexStart ?? 1;

    controlsConfig.forEach((controlConfig, controlIndex) => {
      const controlId = `config_${String(controlConfig.key)}`;

      let controlEl: HTMLElement;
      let inputEl: ControlInputElement;
      let displayValueElement: HTMLSpanElement;
      let label: HTMLLabelElement;

      if (controlConfig.type === 'group') {
        controlEl = document.createElement('expandable-panel');
        controlEl.setAttribute(
          'legend',
          this.getConfigValue(controlConfig.label, this.config)
        );
        controlEl.setAttribute('data-group', String(controlConfig.key));
        controlEl.className = 'control control_group';
        if (controlConfig.defaultValue === 'minimized') {
          controlEl.setAttribute('minimized', 'minimized');
          this.state.groups[String(controlConfig.key)] = false;
        }
        this.renderControls(controlEl, controlConfig.children);
      } else {
        controlEl = document.createElement('div');
        controlEl.className = 'control';

        if (controlConfig.type !== 'checkbox') {
          label = document.createElement('label');
          label.innerHTML = this.getConfigValue(
            controlConfig.label,
            this.config
          );
          label.setAttribute('for', controlId);
        }

        inputEl = document.createElement(
          getElementTagNameForControlType(controlConfig.type)
        ) as ControlInputElement;
        if (isRangeInput(inputEl)) {
          inputEl.classList.add('range-input');
        }
        inputEl.setAttribute('tabindex', String(controlIndex));
        const inputValue =
          this.config[controlConfig.key] ??
          this.getConfigValue(controlConfig.defaultValue, this.config);

        if (controlConfig.type === 'select') {
          const selectOptions = document.createDocumentFragment();
          controlConfig.options.forEach(_option => {
            const { value, label } =
              typeof _option === 'string'
                ? { value: _option, label: _option }
                : _option;
            const optionEl = document.createElement('option');
            optionEl.setAttribute('value', value);
            optionEl.innerText = label;
            selectOptions.appendChild(optionEl);
          });
          inputEl.appendChild(selectOptions);
          (inputEl as HTMLSelectElement).value = String(inputValue);
          controlEl.appendChild(label);
          controlEl.appendChild(inputEl);
        } else {
          if (controlConfig.type !== 'range') {
            inputEl.setAttribute('type', controlConfig.type);
          }

          if (controlConfig.type === 'checkbox') {
            (inputEl as StringArtCheckbox).checked = !!inputValue;
            inputEl.setAttribute(
              'label',
              this.getConfigValue(controlConfig.label, this.config)
            );
            controlEl.appendChild(inputEl);
          } else {
            controlEl.appendChild(label);
            controlEl.appendChild(inputEl);
            setTimeout(() => {
              inputEl.value = String(inputValue);
            });
            displayValueElement = document.createElement('span');
            displayValueElement.id = `config_${String(
              controlConfig.key
            )}_value`;
            displayValueElement.innerText = String(
              controlConfig.displayValue
                ? controlConfig.displayValue(this.config)
                : inputValue
            );
            displayValueElement.className = 'control_input_value';
            controlEl.appendChild(displayValueElement);
          }
        }

        if (controlConfig.attr) {
          Object.entries(controlConfig.attr).forEach(([attr, value]) => {
            const realValue = this.getConfigValue(value, this.config);
            inputEl.setAttribute(attr, String(realValue));
          });
        }

        inputEl.id = controlId;
      }

      this.controlElements[controlConfig.key] = {
        config: controlConfig,
        displayValueElement,
        input: inputEl,
        element: controlEl,
        label,
      };
      controlEl.id = `control_${String(controlConfig.key)}`;
      controlsFragment.appendChild(controlEl);
    });

    containerEl.appendChild(controlsFragment);
    this.updateGroupsState();
    requestAnimationFrame(() => this.updateControlsVisibility());
  }

  updateGroupsState() {
    const groups = elements.design.querySelectorAll('[data-group]');
    groups.forEach(groupEl => {
      if (groupEl instanceof HTMLFieldSetElement) {
        const groupId = groupEl.dataset.group;
        const groupState = this.state.groups[groupId];
        if (typeof groupState === 'boolean') {
          if (groupState) {
            groupEl.classList.remove('minimized');
          } else {
            groupEl.classList.add('minimized');
          }
        }
      }
    });
  }

  getConfigValue<T = PrimitiveValue>(
    valueOrFn: ConfigValueOrFunction<TConfig, T>,
    config: Config<TConfig>
  ): T {
    if (valueOrFn instanceof Function) {
      return valueOrFn(config);
    }

    return valueOrFn;
  }
}

function getInputValue(inputElement: EventTarget) {
  if (isRangeInput(inputElement)) {
    return Number(inputElement.value);
  }

  if (inputElement instanceof HTMLInputElement) {
    const type = inputElement.type;

    switch (type) {
      case 'range':
        return parseFloat(inputElement.value);
      case 'hue':
        return inputElement.value;
      case 'checkbox':
        return inputElement.checked;
      case 'number':
        return parseFloat(inputElement.value);
      default:
        return inputElement.value;
    }
  } else if (inputElement instanceof StringArtCheckbox) {
    return inputElement.checked;
  } else if (inputElement instanceof HTMLSelectElement) {
    return inputElement.value;
  }
}

function getElementTagNameForControlType(controlType: ControlType): string {
  switch (controlType) {
    case 'select':
      return 'select';
    case 'range':
      return 'string-art-range-input';
    case 'hue':
      return 'string-art-hue-input';
    case 'checkbox':
      return 'string-art-checkbox';
    default:
      return 'input';
  }
}

function isRangeInput(
  element: EventTarget
): element is StringArtRangeInput | StringArtHueInput {
  return (
    element instanceof StringArtRangeInput ||
    element instanceof StringArtHueInput
  );
}
