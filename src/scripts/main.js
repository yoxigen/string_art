import Player from "./Player.js";
import patternTypes from "./pattern_types.js";
import EditorControls from "./editor/EditorControls.js";

const elements = {
    canvas: document.querySelector("canvas"),
    patternSelector: document.querySelector("#pattern_select"),
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
const player = new Player(document.querySelector("#player"))
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

function onInputsChange({pattern}) {
    player.update(currentPattern, { goToEnd: false });
    const configQuery = JSON.stringify(pattern.config);
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

