import Player from "./Player.js";
import patternTypes from "./pattern_types.js";

const elements = {
    canvas: document.querySelector("canvas"),
    patternSelector: document.querySelector("#pattern_select"),
    controls: document.querySelector("#controls"),
    patternLink: document.querySelector("#pattern_link"),
    size: {
        sizeSelect: document.querySelector("#size_select"),
        sizeCustom: document.querySelector("#size_custom"),
        width: document.querySelector("#size_custom_width"),
        height: document.querySelector("#size_custom_height"),
    }
};

function cmToPixels(cm, dpi = 300) {
    return Math.floor(cm / 2.54 * dpi);
}

const SCREEN_SIZE = [
    window.screen.width * window.devicePixelRatio,
    window.screen.height * window.devicePixelRatio,
];

const SIZES = [
    { id: 'fit', name: 'Fit to screen' },
    { id: 'A4', value: [20, 28].map(v => cmToPixels(v)) },
    { id: 'A3', value: [28, 40].map(v => cmToPixels(v)) },
    { id: 'screen', name: `Screen size (${SCREEN_SIZE.join('x')})`, value: SCREEN_SIZE},
    { id: 'custom', name: 'Custom...' }
];

const patterns = patternTypes.map(Pattern => new Pattern(elements.canvas));

let currentPattern;
let inputTimeout;
const player = new Player(document.querySelector("#player"))

main();

function main() {
    initControls();
    initRouting();
    initSize();

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

    elements.canvas.addEventListener('click', () => {
        player.toggle();
    });
}

function initControls() {
    elements.controls.addEventListener("input", (e) => {
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

            currentPattern.draw();

            inputTimeout = setTimeout(() => {
                player.update(currentPattern, { goToEnd: false });
                const configQuery = JSON.stringify(currentPattern.config)
                history.replaceState({
                    pattern: currentPattern.id,
                    config: configQuery
                }, currentPattern.name, `?pattern=${currentPattern.id}&config=${encodeURIComponent(configQuery)}`);
                updateControlsVisibility();
            }, 100);
        });
    })

    patterns.forEach(pattern => {
        const option = document.createElement('option');
        option.innerText = pattern.name;
        option.value = pattern.id;
        elements.patternSelector.appendChild(option);
    });

    elements.patternSelector.addEventListener('change', e => {
        const patternId = e.target.value;
        selectPattern(findPatternById(patternId));
        history.pushState({ pattern: patternId }, patternId, "?pattern=" + patternId)
    });
}

function initSize() {
    const sizeOptionsFragment = document.createDocumentFragment();
    SIZES.forEach(size => {
        const sizeListItem = document.createElement('option');
        sizeListItem.setAttribute('value', size.id);
        sizeListItem.innerText = size.name ?? size.id;
        sizeOptionsFragment.appendChild(sizeListItem);
    });
    elements.size.sizeSelect.appendChild(sizeOptionsFragment);

    elements.size.sizeSelect.addEventListener("change", e => {
        const selectedSizeId = e.target.value;
        const size = SIZES.find(({id}) => id === selectedSizeId);

        if (size.id === "custom") {
            elements.size.sizeCustom.removeAttribute('hidden');
            elements.size.width.value = elements.canvas.clientWidth;
            elements.size.height.value = elements.canvas.clientHeight;
        } else {
            elements.size.sizeCustom.setAttribute('hidden', 'hidden');
            elements.canvas.removeAttribute('width');
            elements.canvas.removeAttribute('height');
            elements.canvas.removeAttribute('style');
            const value = size.value instanceof Function ? size.value() : size.value;
            if (value) {
                const [width, height] = value;
                setSize(width, height);
            } else {
                currentPattern.draw();
            }
        }
    });

    elements.size.sizeCustom.addEventListener("focusin", e => {
        e.target.select();
    });

    elements.size.sizeCustom.addEventListener('input', e => {
        setSize(
            parseInt(elements.size.width.value),
            parseInt(elements.size.height.value)
        )
    });

    function setSize(width, height) {
        elements.canvas.style.width = `${width}px`;
        elements.canvas.style.height = `${height}px`;
        currentPattern.draw();
    }
}

function initRouting() {
    window.addEventListener('popstate', ({state}) => {
        updateState(state);
    });
}

function updateState(state) {
    const pattern = findPatternById(state.pattern);
    elements.patternSelector.value = pattern.id;
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
    elements.patternLink.setAttribute("href", pattern.link);
    if (draw) {
        currentPattern.draw();
    }
    player.update(currentPattern);
    document.title = `${pattern.name} - String Art Studio`;
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

function renderControls(containerEl = elements.controls, configControls = currentPattern.configControls) {
    containerEl.innerHTML = "";
    const controlsFragment = document.createDocumentFragment();

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
        controlsFragment.appendChild(controlEl);
    });

    containerEl.appendChild(controlsFragment);
    requestAnimationFrame(() => updateControlsVisibility())
}
