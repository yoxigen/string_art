const elements = {
    controls: document.querySelector("#controls"),
    sidebarForm: document.querySelector("#sidebar_form"),
};

const EVENTS = new Set(['input', 'change']);
let inputTimeout;

export default class EditorControls {
    constructor({pattern}) {
        this.pattern = pattern;
        this.eventHandlers = {
            input: new Set(),
            change: new Set()
        }

        this._wrappedOnInput = e => this._onInput(e);
        this._toggleFieldset = e => {
            if (e.target.nodeName === "LEGEND" ) {
                e.target.parentElement.classList.toggle("minimized");
            }
        };

        elements.controls.addEventListener("input", this._wrappedOnInput);
        elements.sidebarForm.addEventListener("click", this._toggleFieldset);
        this.controlElements = {};
        this.renderControls();
    }

    destroy() {
        elements.controls.removeEventListener("input", this._wrappedOnInput);
        elements.sidebarForm.removeEventListener("click", this._toggleFieldset);
        elements.controls.innerHTML = "";
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
        for(const eventHandler of this.eventHandlers[event]) {
            eventHandler(eventData);
        }
    }

    _onInput(e) {
        requestAnimationFrame(() => {
            clearTimeout(inputTimeout);

            const inputValue = getInputValue(e.target.type, e.target);
            const controlKey = e.target.id.replace(/^config_/, '');

            this.pattern.config = Object.freeze({
                ...this.pattern.config,
                [controlKey]: inputValue
            });

            const {config, displayValue} = this.controlElements[controlKey];
            if (displayValue) {
                const formattedValue = config.displayValue ? config.displayValue(this.pattern.config) : e.target.value;
                displayValue.innerText = formattedValue;
            }

            const eventData = Object.freeze({
                control: controlKey,
                value: inputValue,
                originalEvent: e,
                pattern: this.pattern,
            });

            this._triggerEvent('input', eventData);

            inputTimeout = setTimeout(() => {
                this._triggerEvent('change', eventData);
                this.updateControlsVisibility();
            }, 100);
        });
    }

    updateControlsVisibility(configControls = this.pattern.configControls) {
        configControls.forEach(control => {
            if (control.show) {
                const shouldShowControl = control.show(this.pattern.config);
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
            const {input, value: valueEl} = this.controlElements[key];
            if (input) {
                if (input.type === "checkbox") {
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
        containerEl.innerHTML = "";
        const controlsFragment = document.createDocumentFragment();


        configControls.forEach(control => {
            const controlId = `config_${control.key}`;
            const controlElements = this.controlElements[control.key] = { config: control };

            let controlEl;

            if (control.type === "group") {
                controlEl = document.createElement("fieldset");
                const groupTitleEl = document.createElement("legend");
                groupTitleEl.innerText = control.label;
                controlEl.appendChild(groupTitleEl);
                controlEl.className = "control control_group";
                if (control.defaultValue === "minimized") {
                    controlEl.classList.add('minimized');
                }
                const childrenContainer = document.createElement('div');
                controlEl.appendChild(childrenContainer);
                this.renderControls(childrenContainer, control.children);
            }
            else {
                controlEl = document.createElement("div");
                controlEl.className = "control";

                const label = document.createElement("label");
                label.innerHTML = control.label;
                label.setAttribute("for", controlId);

                const inputEl = controlElements.input = document.createElement("input");
                inputEl.setAttribute("type", control.type);
                const inputValue = this.pattern.config[control.key] ?? control.defaultValue;

                if (control.attr) {
                    Object.entries(control.attr).forEach(([attr, value]) => {
                        const realValue = value instanceof Function ? value(this.pattern) : value;
                        inputEl.setAttribute(attr, realValue)
                    });
                }

                if (control.type === "checkbox") {
                    inputEl.checked = inputValue;
                    controlEl.appendChild(inputEl);
                    controlEl.appendChild(label);
                } else {
                    controlEl.appendChild(label);
                    controlEl.appendChild(inputEl);
                    inputEl.value = inputValue;
                    const inputValueEl = controlElements.displayValue = document.createElement('span');
                    inputValueEl.id = `config_${control.key}_value`;
                    inputValueEl.innerText = control.displayValue ? control.displayValue(this.pattern.config) : inputValue;
                    inputValueEl.className = "control_input_value";
                    controlEl.appendChild(inputValueEl);
                }
                inputEl.id = controlId;
            }

            this.controlElements[control.key].control = controlEl;
            controlEl.id = `control_${control.key}`;
            controlsFragment.appendChild(controlEl);
        });

        containerEl.appendChild(controlsFragment);
        requestAnimationFrame(() => this.updateControlsVisibility())
    }

}


function getInputValue(type, inputElement) {
    switch(type) {
        case 'range':
            return parseFloat(inputElement.value);
        case 'checkbox':
            return inputElement.checked;
        default:
            return inputElement.value;
    }
}
