import StringArtRangeInput from '../components/StringArtRangeInput';
import StringArt from '../StringArt';
import {
  Config,
  ConfigValueOrFunction,
  ControlConfig,
  ControlsConfig,
  PrimitiveValue,
} from '../types/config.types';

const elements = {
  controls: document.querySelector('#controls') as HTMLElement,
  controlsPanel: document.querySelector('#controls_panel') as HTMLElement,
  sidebarForm: document.querySelector('#sidebar_form') as HTMLElement,
};

const EVENTS = new Set(['input', 'change']);
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
  | HTMLSelectElement
) & {
  updateTimeout?: number;
};

interface Control<TConfig> {
  config: ControlConfig<TConfig>;
  input: ControlInputElement;
  element: HTMLElement;
  displayValueElement: HTMLSpanElement;
}

export default class EditorControls<TConfig> {
  pattern: StringArt<TConfig>;
  state: EditorState;
  eventHandlers: {
    input: Set<string>;
    change: Set<string>;
  };
  controlElements: Partial<Record<keyof TConfig, Control<TConfig>>> = {};

  #postponeRangeInput: boolean = false;
  #postponeRangeInputTimeout: number;
  #wrappedOnInput;
  #wrappedOnTouchStart;
  #wrappedOnTouchEnd;
  #wrappedOnRangeScroll;
  #currentInputRange: StringArtRangeInput;
  #currentInputRangeValue: number;
  #rangeLockTimeout: number;
  #lockRange: boolean = false;
  #boundToggleFieldset;

  constructor(pattern: StringArt<TConfig>) {
    this.pattern = pattern;
    this.state = this._getState() ?? { groups: {} };

    this.eventHandlers = {
      input: new Set(),
      change: new Set(),
    };

    this.#wrappedOnInput = this.#onInput.bind(this);
    elements.controls.addEventListener('input', this.#wrappedOnInput);
    this.#wrappedOnTouchStart = this.#onTouchStart.bind(this);
    elements.controls.addEventListener('touchstart', this.#wrappedOnTouchStart);
    elements.controls.addEventListener('mousedown', this.#onMouseDown);
    this.#boundToggleFieldset = this.#toggleFieldset.bind(this);
    elements.sidebarForm.addEventListener('click', this.#boundToggleFieldset);
    elements.sidebarForm.addEventListener(
      'keydown',
      this.#toggleFieldSetOnEnter
    );
    this.controlElements = {};
    this.renderControls();
  }

  destroy() {
    elements.controls.removeEventListener('input', this.#wrappedOnInput);
    elements.sidebarForm.removeEventListener(
      'click',
      this.#boundToggleFieldset
    );
    elements.sidebarForm.removeEventListener(
      'keydown',
      this.#toggleFieldSetOnEnter
    );
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

  addEventListener(event, eventHandler) {
    if (!EVENTS.has(event)) {
      throw new Error(`Unsupported event for EditorControls, "${event}"!`);
    }

    if (!(eventHandler instanceof Function)) {
      throw new Error('Invalid event handler.');
    }

    this.eventHandlers[event].add(eventHandler);
  }

  _triggerEvent(event, eventData) {
    for (const eventHandler of this.eventHandlers[event]) {
      eventHandler(eventData);
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
    if (e.target instanceof StringArtRangeInput) {
      this.#postponeRangeInput = true;
      this.#currentInputRange = e.target;
      this.#currentInputRangeValue = e.target.value;
      this.#rangeLockTimeout = window.setTimeout(() => {
        this.#postponeRangeInput = false;
      }, RANGE_SCROLL_LOCK_TIMEOUT);
      this.#wrappedOnTouchEnd = this.#onTouchEnd.bind(this);
      document.body.addEventListener('touchend', this.#wrappedOnTouchEnd);
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

    if (this.#postponeRangeInput && e.target instanceof StringArtRangeInput) {
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
      e.target instanceof StringArtRangeInput ||
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
        ? config.displayValue(this.pattern.config)
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
    const inputValue = getInputValue(inputElement);
    const controlKey = inputElement.id.replace(/^config_/, '') as keyof TConfig;

    if (this.pattern.config[controlKey] === inputValue) {
      return;
    }

    this.pattern.setConfigValue(controlKey, inputValue);

    this.updateControlDisplayValue(controlKey);

    const eventData = Object.freeze({
      control: controlKey,
      value: inputValue,
      originalEvent,
      pattern: this.pattern,
    });

    this._triggerEvent('input', eventData);

    const triggerChange = () => {
      this._triggerEvent('change', eventData);
      this.updateControlsVisibility();
    };

    this.updateControlsAttributes();

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

  updateControlsAttributes(configControls = this.pattern.configControls) {
    configControls.forEach(control => {
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
                this.pattern.config
              );
              if (newAttrValue != inputEl.getAttribute(name)) {
                if (
                  (name === 'min' && inputEl.value < newAttrValue) ||
                  (name === 'max' && inputEl.value > newAttrValue)
                ) {
                  inputEl.value = String(newAttrValue);
                  clearTimeout(inputEl.updateTimeout);
                  inputEl.updateTimeout = window.setTimeout(() => {
                    this.updateInput({ inputElement: inputEl });
                  }, 100);
                }
                inputEl.setAttribute(name, String(newAttrValue));
              }
            });
          }
        }
      }
    });
  }

  updateControlsVisibility(configControls?: ControlsConfig<TConfig>) {
    (configControls ?? this.pattern.configControls).forEach(control => {
      if (control.show) {
        const shouldShowControl = control.show(this.pattern.config);
        const controlEl = this.controlElements[control.key].element;
        if (controlEl) {
          if (shouldShowControl) {
            controlEl.removeAttribute('hidden');
          } else {
            controlEl.setAttribute('hidden', 'hidden');
          }
        }
      }

      if (control.isDisabled) {
        const shouldDisableControl = control.isDisabled(this.pattern.config);
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
    _configControls?: ControlsConfig<TConfig>
  ) {
    const configControls = _configControls ?? this.pattern.configControls;
    containerEl.innerHTML = '';
    const controlsFragment = document.createDocumentFragment();

    configControls.forEach(controlConfig => {
      const controlId = `config_${String(controlConfig.key)}`;

      let controlEl: HTMLElement;
      let inputEl: ControlInputElement;
      let displayValueElement: HTMLSpanElement;

      if (controlConfig.type === 'group') {
        controlEl = document.createElement('fieldset');
        controlEl.setAttribute('data-group', String(controlConfig.key));
        const groupTitleEl = document.createElement('legend');
        groupTitleEl.setAttribute('tabindex', '0');
        groupTitleEl.innerText = controlConfig.label;
        controlEl.appendChild(groupTitleEl);
        controlEl.className = 'control control_group';
        if (controlConfig.defaultValue === 'minimized') {
          controlEl.classList.add('minimized');
          this.state.groups[String(controlConfig.key)] = false;
        }
        const childrenContainer = document.createElement('div');
        controlEl.appendChild(childrenContainer);
        this.renderControls(childrenContainer, controlConfig.children);
      } else {
        controlEl = document.createElement('div');
        controlEl.className = 'control';

        const label = document.createElement('label');
        label.innerHTML = controlConfig.label;
        label.setAttribute('for', controlId);

        inputEl = document.createElement(
          controlConfig.type === 'select'
            ? 'select'
            : controlConfig.type === 'range'
            ? 'string-art-range-input'
            : 'input'
        ) as ControlInputElement;

        const inputValue =
          this.pattern.config[controlConfig.key] ??
          this.getConfigValue(controlConfig.defaultValue, this.pattern.config);

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
          inputEl.setAttribute('type', controlConfig.type);

          if (controlConfig.type === 'checkbox') {
            (inputEl as HTMLInputElement).checked = !!inputValue;
            controlEl.appendChild(inputEl);
            controlEl.appendChild(label);
          } else {
            controlEl.appendChild(label);
            controlEl.appendChild(inputEl);
            setTimeout(() => {
              inputEl.value = String(inputValue);
            });
            const displayValueElement = document.createElement('span');
            displayValueElement.id = `config_${String(
              controlConfig.key
            )}_value`;
            displayValueElement.innerText = String(
              controlConfig.displayValue
                ? controlConfig.displayValue(this.pattern.config)
                : inputValue
            );
            displayValueElement.className = 'control_input_value';
            controlEl.appendChild(displayValueElement);
          }
        }

        if (controlConfig.attr) {
          Object.entries(controlConfig.attr).forEach(([attr, value]) => {
            const realValue = this.getConfigValue(value, this.pattern.config);
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
      };
      controlEl.id = `control_${String(controlConfig.key)}`;
      controlsFragment.appendChild(controlEl);
    });

    containerEl.appendChild(controlsFragment);
    this.updateGroupsState();
    requestAnimationFrame(() => this.updateControlsVisibility());
  }

  updateGroupsState() {
    const groups = elements.sidebarForm.querySelectorAll('[data-group]');
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

  getConfigValue(
    valueOrFn: ConfigValueOrFunction<TConfig>,
    config: Config<TConfig>
  ): PrimitiveValue {
    if (valueOrFn instanceof Function) {
      return valueOrFn(config);
    }

    return valueOrFn;
  }
}

function getInputValue(inputElement: EventTarget) {
  if (inputElement instanceof StringArtRangeInput) {
    return Number(inputElement.value);
  }

  if (inputElement instanceof HTMLInputElement) {
    const type = inputElement.type;

    switch (type) {
      case 'range':
        return parseFloat(inputElement.value);
      case 'checkbox':
        return inputElement.checked;
      case 'number':
        return parseFloat(inputElement.value);
      default:
        return inputElement.value;
    }
  }
}
