import Player from "./Player.js";
import patternTypes from "./pattern_types.js";

const canvas = document.querySelector("canvas");
const patternSelector = document.querySelector("#pattern_select");
const controlsEl = document.querySelector("#controls");
const patternLinkEl = document.querySelector("#pattern_link");
const patterns = patternTypes.map(Pattern => new Pattern(canvas));

let currentPattern;
let inputTimeout;
const player = new Player(document.querySelector("#player"))

main();

function main() {
    initControls();
    initRouting();

    if (history.state?.pattern) {
        updateState(history.state);
    } else {
        const queryParams = new URLSearchParams(document.location.search);
        const queryPattern = queryParams.get('pattern');

        if (queryPattern) {
            const config = queryParams.get('config');
            updateState({ pattern: queryPattern, config })
        } else {
            selectPattern(patterns[0]);
        }
    }

    window.addEventListener("resize", () =>
        currentPattern.draw()
    );
}

function initControls() {
    controlsEl.addEventListener("input", (e) => {
        requestAnimationFrame(() => {
            clearTimeout(inputTimeout);

            const inputValue = getInputValue(e.target.type, e.target);
            const controlKey = e.target.id.replace(/^config_/, '');
    
            currentPattern.config = Object.freeze({
                ...currentPattern.config,
                [controlKey]: inputValue
            });
            const inputValueEl = document.querySelector("#" + e.target.id + "_value");
            if (inputValueEl) {
                inputValueEl.innerText = e.target.value;
            }
    
            player.update(currentPattern, { goToEnd: false });
            currentPattern.draw();
            
            inputTimeout = setTimeout(() => {
                const configQuery = JSON.stringify(currentPattern.config)
                history.replaceState({
                    pattern: currentPattern.id,
                    config: configQuery
                }, currentPattern.name, `?pattern=${currentPattern.id}&config=${encodeURIComponent(configQuery)}`);
                updateControlsVisibility();
            }, 100);
        })
    })

    patterns.forEach(pattern => {
        const option = document.createElement('option');
        option.innerText = pattern.name;
        option.value = pattern.id;
        patternSelector.appendChild(option);
    });
    
    patternSelector.addEventListener('change', e => {
        const patternId = e.target.value;
        selectPattern(findPatternById(patternId));
        history.pushState({ pattern: patternId }, patternId, "?pattern=" + patternId)
    });
}

function initRouting() {
    window.addEventListener('popstate', ({state}) => {
        updateState(state);
    });
}

function updateState(state) {
    const pattern = findPatternById(state.pattern);
    patternSelector.value = pattern.id;
    selectPattern(pattern, { 
        draw: false,
        config: state.config ? JSON.parse(state.config) : null
    });
    
    currentPattern.draw();
    updateInputs(currentPattern.config);
}

function updateInputs(config) {
    Object.entries(config).forEach(([key, value]) => {
        const inputEl = document.querySelector(`#config_${key}`);
        if (inputEl) {
            const inputValueEl = document.querySelector(`#config_${key}_value`);

            if (inputEl.type === "checkbox") {
                inputEl.checked = value;
            } else {
                inputEl.value = value;
            }
            if (inputValueEl) {
                inputValueEl.innerText = value;
            }
        }
    });
}

function findPatternById(patternId) {
    const pattern = patterns.find(({id}) => id === patternId);
    if (!pattern) {
        throw new Error(`Pattern with id "${patternId} not found!`);
    }
    return pattern;
}

function selectPattern(pattern, { config, draw = true} = {}) {
    currentPattern = pattern;
    if (config) {
        currentPattern.config = config;
    }

    renderControls();
    patternLinkEl.setAttribute("href", pattern.link);
    if (draw) {
        currentPattern.draw();
    }
    player.update(currentPattern);
    document.title = `${pattern.name} - String Art Pattern Creator`;
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

function updateControlsVisibility(configControls = currentPattern.configControls) {
    configControls.forEach(control => {
        if (control.show) {
            const shouldShowControl = control.show(currentPattern.config);
            const controlEl = document.querySelector(`#control_${control.key}`);
            if (controlEl) {
                if (shouldShowControl) {
                    controlEl.removeAttribute('hidden');
                } else {
                    controlEl.setAttribute('hidden', 'hidden');
                }
            }
        }

        if (control.isDisabled) {
            const shouldDisableControl = control.isDisabled(currentPattern.config);
            const inputEl = document.querySelector(`#config_${control.key}`);
            if (inputEl) {
                if (shouldDisableControl) {
                    inputEl.setAttribute('disabled', 'disabled');
                } else {
                    inputEl.removeAttribute('disabled');
                }
            }
        }

        if (control.children) {
            updateControlsVisibility(control.children);
        }
    });
}

function renderControls(containerEl = controlsEl, configControls = currentPattern.configControls) {
    containerEl.innerHTML = "";

    configControls.forEach(control => {
        const controlId = `config_${control.key}`;
        let controlEl;

        if (control.type === "group") {
            controlEl = document.createElement("fieldset");
            const groupTitleEl = document.createElement("legend");
            groupTitleEl.innerText = control.label;
            controlEl.appendChild(groupTitleEl);
            controlEl.className = "control control_group";
            const childrenContainer = document.createElement('div');
            controlEl.appendChild(childrenContainer);
            renderControls(childrenContainer, control.children);    
        }
        else {
            controlEl = document.createElement("div");
            controlEl.className = "control";

            const label = document.createElement("label");
            label.innerHTML = control.label;
            label.setAttribute("for", controlId);

            const inputEl = document.createElement("input");

            inputEl.setAttribute("type", control.type);
            const inputValue = currentPattern.config[control.key] ?? control.defaultValue;

            if (control.attr) {
                Object.entries(control.attr).forEach(([attr, value]) => { 
                    const realValue = value instanceof Function ? value(currentPattern) : value;
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
                const inputValueEl = document.createElement('span');
                inputValueEl.id = `config_${control.key}_value`;
                inputValueEl.innerText = inputValue;
                inputValueEl.className = "control_input_value";
                controlEl.appendChild(inputValueEl);
            }
            inputEl.id = controlId;
        }

        controlEl.id = `control_${control.key}`;
        containerEl.appendChild(controlEl);
    });

    requestAnimationFrame(() => updateControlsVisibility())
}