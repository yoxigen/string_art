const elements = {
    controls: document.querySelector("#controls"),
    sidebarForm: document.querySelector("#sidebar_form"),
};

const EVENTS = new Set(['input', 'change']);
const STATE_LOCAL_STORAGE_KEY = 'controls_state';

let inputTimeout;

export default class EditorControls {
    constructor({pattern}) {
        this.pattern = pattern;
        this.state = this._getState() ?? { groups: {}};

        this.eventHandlers = {
            input: new Set(),
            change: new Set()
        }

        this._wrappedOnInput = e => this._onInput(e);
        this._toggleFieldset = e => {
            if (e.target.nodeName === "LEGEND" ) {
                e.target.parentElement.classList.toggle("minimized");
                const groupId = e.target.parentElement.dataset.group;
                this.state = { ...this.state, groups: { ...this.state.groups, [groupId]: !e.target.parentElement.classList.contains("minimized")}};
                this._updateState(this.state);
            }
        };

        this._toggleFieldSetOnEnter = e => {
            if (e.target.nodeName === "LEGEND" && e.key === "Enter") {
                this._toggleFieldset(e);
            }
        }

        elements.controls.addEventListener("input", this._wrappedOnInput);
        elements.sidebarForm.addEventListener("click", this._toggleFieldset);
        elements.sidebarForm.addEventListener("keydown", this._toggleFieldSetOnEnter);
        this.controlElements = {};
        this.controlElementsMap = new Map;
        this.renderControls({ configControls: this.pattern.configControls });
    }

    destroy() {
        elements.controls.removeEventListener("input", this._wrappedOnInput);
        elements.sidebarForm.removeEventListener("click", this._toggleFieldset);
        elements.sidebarForm.removeEventListener("keydown", this._toggleFieldSetOnEnter);
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

            const {control, displayValue, configPath} = this.controlElementsMap.get(e.target);
            
            const newConfig = {...this.pattern.config};
            let configPathValue = newConfig;

            for (let i=0; i < configPath.length - 1; i++) {
                configPathValue = configPathValue[configPath[i]];
            }
            configPathValue[configPath.slice(-1)] = inputValue;

            this.pattern.config = Object.freeze(newConfig);

            if (displayValue) {
                const value = e.target.value;
                const formattedValue = control.displayValue 
                    ? control.displayValue({ 
                        value, 
                        config: this.pattern.config, 
                        control
                    }) : value;
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

    _getState() {
        const state = localStorage.getItem(STATE_LOCAL_STORAGE_KEY);
        if (state) {
            try {
                return JSON.parse(state);
            } catch(e) {
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

    updateControlsVisibility() {
        this.controlElementsMap.forEach(({control, input, controlEl, configPath}) => {
            const controlConfigValue = this.getConfigValueAtPath(configPath);
            if (control.show) {
                const shouldShowControl = control.show(this.pattern.config, controlConfigValue);
                if (shouldShowControl) {
                    controlEl.removeAttribute('hidden');
                } else {
                    controlEl.setAttribute('hidden', 'hidden');
                }
            }

            if (control.isDisabled) {
                const shouldDisableControl = control.isDisabled(this.pattern.config, controlConfigValue);
                if (input) {
                    if (shouldDisableControl) {
                        input.setAttribute('disabled', 'disabled');
                    } else {
                        input.removeAttribute('disabled');
                    }
                }
            }
        });
    }

    getConfigValueAtPath(path) {
        return path.reduce((value, configPath) => value[configPath], this.pattern.config);
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

    renderControls({containerEl = elements.controls, configControls, parentControl, parentKey, useControlIndexForPath, addControlToPath = true, configPath = []}) {
        containerEl.innerHTML = "";
        const controlsFragment = document.createDocumentFragment();

        configControls.forEach((control, controlIndex) => {
            const controlId = `config_${parentKey ? parentKey + '_' : ''}${control.key}`;
            const controlElements = this.controlElements[control.key] = { config: control };
            let controlEl;
            let inputEl;
            let displayValueEl;
            const controlConfigPath = control.type !== "group" || useControlIndexForPath || control.addChild ? [...configPath, useControlIndexForPath ? controlIndex : control.key] : configPath;

            if (control.type === "group") {
                controlEl = this._createGroupControl({ control, parentKey, configPath: controlConfigPath });
            }
            else {
                controlEl = document.createElement("div");
                controlEl.className = "control";

                const label = document.createElement("label");
                label.innerHTML = control.label;
                label.setAttribute("for", controlId);

                inputEl = controlElements.input = document.createElement("input");
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
                    displayValueEl = controlElements.displayValue = document.createElement('span');
                    displayValueEl.id = `config_${control.key}_value`;
                    displayValueEl.innerText = control.displayValue 
                        ? control.displayValue({ 
                            value: inputValue, 
                            config: this.pattern.config, 
                            control 
                        }) 
                        : inputValue;
                        displayValueEl.className = "control_input_value";
                    controlEl.appendChild(displayValueEl);
                }
                inputEl.id = controlId;
            }

            this.controlElements[control.key].control = controlEl;
            controlEl.id = `control_${parentKey ? parentKey + '_' : ''}${control.key}`;
            this.controlElementsMap.set(inputEl ?? controlEl, { 
                control, 
                parent: parentControl, 
                input: inputEl, 
                controlEl,
                displayValue: displayValueEl,
                configPath: controlConfigPath
            });

            if (parentKey) {
                controlEl.setAttribute('data-parent', parentKey);
            }
            controlsFragment.appendChild(controlEl);
        });

        containerEl.appendChild(controlsFragment);
        this.updateGroupsState();
        requestAnimationFrame(() => this.updateControlsVisibility())
    }

    _createGroupControl({control, configPath}) {
        const controlEl = document.createElement("fieldset");
        controlEl.setAttribute('data-group', control.key);
        const groupTitleEl = document.createElement("legend");
        groupTitleEl.setAttribute("tabindex", "0");
        groupTitleEl.innerText = control.label;
        controlEl.appendChild(groupTitleEl);
        controlEl.className = "control control_group";
        const childrenContainer = document.createElement('div');
        controlEl.appendChild(childrenContainer);

        if (control.addChild) {
            const children = (control.defaultValue ?? [])
                .map((defaultValue, childIndex) => Object.assign(
                    control.addChild.getNewChild({ childIndex, defaultValue }),
                    { key: `${control.key}__${childIndex}`}
                ));

            this.renderControls({ 
                containerEl: childrenContainer, 
                configControls: children, 
                parentKey: control.key, 
                parentControl: control,
                useControlIndexForPath: true,
                configPath
            });

            const addChildBtn = document.createElement('button');
            addChildBtn.className = 'btn add_btn';
            addChildBtn.innerText = control.addChild.btnText ?? 'Add new';
            addChildBtn.setAttribute('type', 'button');
            addChildBtn.addEventListener('click', () => {
                control.addChild.getNewChild({ childIndex: children.length + 1 })
            });

            controlEl.appendChild(addChildBtn);
        } else {
            this.renderControls({ 
                containerEl: childrenContainer, 
                configControls: control.children, 
                parentKey: control.key, 
                parentControl: control,
                configPath,
            });
        }

        return controlEl;
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
    switch(type) {
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
