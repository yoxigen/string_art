import Player from "./editor/Player.js";
import patternTypes from "./pattern_types.js";
import EditorControls from "./editor/EditorControls.js";
import EditorSizeControls from "./editor/EditorSizeControls.js";

const elements = {
    canvas: document.querySelector("canvas"),
    patternSelector: document.querySelector("#pattern_select"),
    patternLink: document.querySelector("#pattern_link"),
};

const patterns = patternTypes.map(Pattern => new Pattern(elements.canvas));

let currentPattern;
const player = new Player(document.querySelector("#player"));
const sizeControls = new EditorSizeControls({
    getCurrentSize: () => [
        elements.canvas.clientWidth,
        elements.canvas.clientHeight
    ]
});

let controls;

main();

function main() {
    initRouting();
    initSize();
    initControls();

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

function onInputsChange() {
    player.update(currentPattern, { goToEnd: false });
    const configQuery = JSON.stringify(currentPattern.config);
    history.replaceState({
        pattern: currentPattern.id,
        config: configQuery
    }, currentPattern.name, `?pattern=${currentPattern.id}&config=${encodeURIComponent(configQuery)}`);
}

function initControls() {
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
    sizeControls.element.addEventListener('sizechange', ({ detail: {width, height}}) => {
        elements.canvas.removeAttribute('width');
        elements.canvas.removeAttribute('height');

        if (width && height) {
            elements.canvas.style.width = `${width}px`;
            elements.canvas.style.height = `${height}px`;
        } else {
            elements.canvas.removeAttribute('style');
        }

        currentPattern.draw();
    });
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
    if (controls) {
        controls.destroy();
    }
    controls = new EditorControls({pattern, config});
    controls.addEventListener('input', () => currentPattern.draw());
    controls.addEventListener('change', onInputsChange);

    elements.patternLink.setAttribute("href", pattern.link);
    if (draw) {
        currentPattern.draw();
    }
    player.update(currentPattern);
    document.title = `${pattern.name} - String Art Studio`;
}
