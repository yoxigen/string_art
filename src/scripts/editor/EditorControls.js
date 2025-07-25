const elements = {
  controls: document.querySelector('#controls'),
  controlsPanel: document.querySelector('#controls_panel'),
  sidebarForm: document.querySelector('#sidebar_form'),
};

const EVENTS = new Set(['input', 'change']);
const STATE_LOCAL_STORAGE_KEY = 'controls_state';
const RANGE_SCROLL_LOCK_TIMEOUT = 120;

let inputTimeout;

export default class EditorControls {
  constructor({ pattern }) {
    this.pattern = pattern;
    this.state = this._getState() ?? { groups: {} };

    this.eventHandlers = {
      input: new Set(),
      change: new Set(),
    };

    this._toggleFieldset = e => {
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
    };

    this._toggleFieldSetOnEnter = e => {
      if (e.target.nodeName === 'LEGEND' && e.key === 'Enter') {
        this._toggleFieldset(e);
      }
    };

    this._wrappedOnInput = e => this._onInput(e);
    elements.controls.addEventListener('input', this._wrappedOnInput);
    this._wrappedOnTouchStart = e => this._onTouchStart(e);
    this._wrappedOnMouseDown = e => this._onMouseDown(e);
    elements.controls.addEventListener('touchstart', this._wrappedOnTouchStart);
    elements.controls.addEventListener('mousedown', this._wrappedOnMouseDown);
    elements.sidebarForm.addEventListener('click', this._toggleFieldset);
    elements.sidebarForm.addEventListener(
      'keydown',
      this._toggleFieldSetOnEnter
    );
    this.controlElements = {};
    this.renderControls();
  }

  destroy() {
    elements.controls.removeEventListener('input', this._wrappedOnInput);
    elements.sidebarForm.removeEventListener('click', this._toggleFieldset);
    elements.sidebarForm.removeEventListener(
      'keydown',
      this._toggleFieldSetOnEnter
    );
    elements.controls.removeEventListener(
      'touchstart',
      this._wrappedOnTouchStart
    );
    elements.controls.removeEventListener(
      'mousedown',
      this._wrappedOnMouseDown
    );
    elements.controls.innerHTML = '';
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

  _onMouseDown(e) {
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
  _onTouchStart(e) {
    if (e.target.getAttribute('type') === 'range') {
      this._postponeRangeInput = true;
      this.currentInputRange = e.target;
      this.currentInputRangeValue = e.target.value;
      this._rangeLockTimeout = setTimeout(() => {
        this._postponeRangeInput = false;
      }, RANGE_SCROLL_LOCK_TIMEOUT);
      this._wrappedOnTouchEnd = e => this._onTouchEnd(e);
      document.body.addEventListener('touchend', this._wrappedOnTouchEnd);
      this._wrappedOnRangeScroll = e => this._onRangeScroll(e);
      elements.controlsPanel.addEventListener(
        'scroll',
        this._wrappedOnRangeScroll
      );
    }
  }

  _onTouchEnd() {
    document.body.removeEventListener('touchend', this._wrappedOnTouchEnd);
    elements.controlsPanel.removeEventListener(
      'scroll',
      this._wrappedOnRangeScroll
    );

    if (this._lockRange) {
      this._lockRange = false;
      if (this.currentInputRange) {
        this.currentInputRange.value = this.currentInputRangeValue;
      }
    }

    this.currentInputRange = this.currentInputRangeValue = null;
  }

  _onRangeScroll() {
    this._lockRange = true;
  }

  _onInput(e) {
    clearTimeout(inputTimeout);
    clearTimeout(this._postponeRangeInputTimeout);

    if (this._postponeRangeInput && e.target.getAttribute('type') === 'range') {
      e.preventDefault();
      this._postponeRangeInputTimeout = setTimeout(() => {
        this._onInput(e);
      }, RANGE_SCROLL_LOCK_TIMEOUT);
      return false;
    }
    if (this._lockRange) {
      e.preventDefault();
      return false;
    }

    this.updateInput({
      inputElement: e.target,
      originalEvent: e,
      deferChange: true,
    });
  }

  updateInput({ inputElement, originalEvent, deferChange = true }) {
    const inputValue = getInputValue(inputElement.type, inputElement);
    const controlKey = inputElement.id.replace(/^config_/, '');

    this.pattern.setConfigValue(controlKey, inputValue);

    const { config, displayValue } = this.controlElements[controlKey];
    if (displayValue) {
      const formattedValue = config.displayValue
        ? config.displayValue(this.pattern.config, config)
        : inputElement.value;
      displayValue.innerText = formattedValue;
    }

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
      this.updateControlsAttributes();
    };

    if (deferChange) {
      inputTimeout = setTimeout(triggerChange, 100);
    } else {
      triggerChange();
    }
  }

  _getState() {
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
      if (control.attr) {
        const functionAttrs = Object.entries(control.attr).filter(
          ([_, value]) => value instanceof Function
        );
        if (functionAttrs.length) {
          const inputEl = this.controlElements[control.key].input;
          if (inputEl) {
            functionAttrs.forEach(([name, value]) => {
              const newAttrValue = value(this.pattern);
              if (newAttrValue != inputEl.getAttribute(name)) {
                if (
                  (name === 'min' && inputEl.value < newAttrValue) ||
                  (name === 'max' && inputEl.value > newAttrValue)
                ) {
                  inputEl.value = newAttrValue;
                  this.updateInput({ inputElement: inputEl });
                }
                inputEl.setAttribute(name, newAttrValue);
              }
            });
          }
        }
      }
    });
  }

  updateControlsVisibility(configControls = this.pattern.configControls) {
    configControls.forEach(control => {
      if (control.show) {
        const shouldShowControl = control.show(this.pattern.config, control);
        const controlEl = this.controlElements[control.key].control;
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

  updateInputs(config) {
    Object.entries(config).forEach(([key, value]) => {
      const { input, value: valueEl } = this.controlElements[key];
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = value;
        } else {
          input.value = value;
        }
        if (valueEl) {
          valueEl.innerText = value;
        }
      }
    });
  }

  renderControls(containerEl = elements.controls, _configControls) {
    const configControls = _configControls ?? this.pattern.configControls;
    containerEl.innerHTML = '';
    const controlsFragment = document.createDocumentFragment();

    configControls.forEach(control => {
      const controlId = `config_${control.key}`;
      const controlElements = (this.controlElements[control.key] = {
        config: control,
      });

      let controlEl;

      if (control.type === 'group') {
        controlEl = document.createElement('fieldset');
        controlEl.setAttribute('data-group', control.key);
        const groupTitleEl = document.createElement('legend');
        groupTitleEl.setAttribute('tabindex', '0');
        groupTitleEl.innerText = control.label;
        controlEl.appendChild(groupTitleEl);
        controlEl.className = 'control control_group';
        if (control.defaultValue === 'minimized') {
          controlEl.classList.add('minimized');
          this.state.groups[control.key] = false;
        }
        const childrenContainer = document.createElement('div');
        controlEl.appendChild(childrenContainer);
        this.renderControls(childrenContainer, control.children);
      } else {
        controlEl = document.createElement('div');
        controlEl.className = 'control';

        const label = document.createElement('label');
        label.innerHTML = control.label;
        label.setAttribute('for', controlId);

        const inputEl = (controlElements.input = document.createElement(
          control.type === 'select' ? 'select' : 'input'
        ));

        const inputValue =
          this.pattern.config[control.key] ?? control.defaultValue;

        if (control.type === 'select') {
          const selectOptions = document.createDocumentFragment();
          control.options.forEach(_option => {
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
          inputEl.value = inputValue;
          controlEl.appendChild(label);
          controlEl.appendChild(inputEl);
        } else {
          inputEl.setAttribute('type', control.type);

          if (control.type === 'checkbox') {
            inputEl.checked = inputValue;
            controlEl.appendChild(inputEl);
            controlEl.appendChild(label);
          } else {
            controlEl.appendChild(label);
            controlEl.appendChild(inputEl);
            setTimeout(() => {
              inputEl.value = inputValue;
            });
            const inputValueEl = (controlElements.displayValue =
              document.createElement('span'));
            inputValueEl.id = `config_${control.key}_value`;
            inputValueEl.innerText = control.displayValue
              ? control.displayValue(this.pattern.config, control)
              : inputValue;
            inputValueEl.className = 'control_input_value';
            controlEl.appendChild(inputValueEl);
          }
        }

        if (control.attr) {
          Object.entries(control.attr).forEach(([attr, value]) => {
            const realValue =
              value instanceof Function ? value(this.pattern) : value;
            inputEl.setAttribute(attr, realValue);
          });
        }

        inputEl.id = controlId;
      }

      this.controlElements[control.key].control = controlEl;
      controlEl.id = `control_${control.key}`;
      controlsFragment.appendChild(controlEl);
    });

    containerEl.appendChild(controlsFragment);
    this.updateGroupsState();
    requestAnimationFrame(() => this.updateControlsVisibility());
  }

  updateGroupsState() {
    const groups = elements.sidebarForm.querySelectorAll('[data-group]');
    groups.forEach(groupEl => {
      const groupId = groupEl.dataset.group;
      const groupState = this.state.groups[groupId];
      if (typeof groupState === 'boolean') {
        if (groupState) {
          groupEl.classList.remove('minimized');
        } else {
          groupEl.classList.add('minimized');
        }
      }
    });
  }
}

function getInputValue(type, inputElement) {
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
