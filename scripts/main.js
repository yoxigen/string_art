import Spirals from "./string_art_types/Spirals.js";
import Spiral from './string_art_types/Spiral.js';
import Eye from './string_art_types/Eye.js';

const canvas = document.querySelector("canvas");
const patternSelector = document.querySelector("#pattern_select");
const controlsEl = document.querySelector("#controls");
const patternTypes = [Spirals, Spiral, Eye];
const patterns = patternTypes.map(Pattern => new Pattern(canvas));
let currentPattern;

main();

function main() {
    initControls();
    initRouting();

    if (history.state?.pattern) {
        updateState(history.state);
    } else {
        selectPattern(patterns[0]);
    }

    window.addEventListener("resize", () =>
        currentPattern.draw()
    );
}

function initControls() {
    controlsEl.addEventListener("input", (e) => {
        requestAnimationFrame(() => {
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
    
            currentPattern.draw();
        })
    })
    
    controlsEl.addEventListener('change', e => {
        const configQuery = JSON.stringify(currentPattern.config)
        history.replaceState({
            pattern: currentPattern.id,
            config: configQuery
        }, currentPattern.name, `?pattern=${currentPattern.id}&config=${encodeURIComponent(configQuery)}`)
    });

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
    selectPattern(pattern);
    if (state.config) {
        currentPattern.config = JSON.parse(state.config);
        currentPattern.draw();
        updateInputs(currentPattern.config);
    }
}

function updateInputs(config) {
    Object.entries(config).forEach(([key, value]) => {
        const inputEl = document.querySelector(`#config_${key}`);
        const inputValueEl = document.querySelector(`#config_${key}_value`);

        if (inputEl.type === "checkbox") {
            inputEl.checked = value;
        } else {
            inputEl.value = value;
        }
        if (inputValueEl) {
            inputValueEl.innerText = value;
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

function selectPattern(pattern) {
    currentPattern = pattern;
    renderControls(pattern);
    currentPattern.draw();
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

function renderControls(pattern) {
    controlsEl.innerHTML = "";

    pattern.configControls.forEach(control => {
        const controlId = `config_${control.key}`;

        const controlEl = document.createElement("div");
        const label = document.createElement("label");
        label.innerHTML = control.label;
        label.setAttribute("for", controlId);
        controlEl.appendChild(label);

        const inputEl = document.createElement("input");
        controlEl.appendChild(inputEl);

        inputEl.setAttribute("type", control.type);
        if (control.type === "checkbox") {
            inputEl.checked = control.defaultValue;
        } else {
            inputEl.value = control.defaultValue;
            const inputValueEl = document.createElement('span');
            inputValueEl.id = `config_${control.key}_value`;
            inputValueEl.innerText = control.defaultValue;
            inputValueEl.className = "control_input_value";
            controlEl.appendChild(inputValueEl);
        }
        inputEl.id = controlId;
        if (control.attr) {
            Object.entries(control.attr).forEach(([attr, value]) => inputEl.setAttribute(attr, value));
        }
        controlsEl.appendChild(controlEl);
    });
}