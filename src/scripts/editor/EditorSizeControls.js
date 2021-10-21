const elements = {
    sizeSelect: document.querySelector("#size_select"),
    sizeCustom: document.querySelector("#size_custom"),
    width: document.querySelector("#size_custom_width"),
    height: document.querySelector("#size_custom_height"),
};

function cmToPixels(cm, dpi = 300) {
    return Math.floor(cm / 2.54 * dpi);
}

const SCREEN_SIZE = [
    Math.floor(window.screen.width * window.devicePixelRatio),
    Math.floor(window.screen.height * window.devicePixelRatio),
];

const SIZES = [
    { id: 'fit', name: 'Fit to screen' },
    { id: 'A4', value: [20, 28].map(v => cmToPixels(v)) },
    { id: 'A3', value: [28, 40].map(v => cmToPixels(v)) },
    { id: 'screen', name: `Screen size (${SCREEN_SIZE.join('x')})`, value: SCREEN_SIZE},
    { id: 'custom', name: 'Custom...' }
];

export default class EditorSizeControls {
    element = document.querySelector("#size_controls");

    constructor({ getCurrentSize }) {
        const sizeOptionsFragment = document.createDocumentFragment();
        SIZES.forEach(size => {
            const sizeListItem = document.createElement('option');
            sizeListItem.setAttribute('value', size.id);
            sizeListItem.innerText = size.name ?? size.id;
            sizeOptionsFragment.appendChild(sizeListItem);
        });
        elements.sizeSelect.appendChild(sizeOptionsFragment)
        elements.sizeSelect.addEventListener("change", e => {
            const selectedSizeId = e.target.value;
            const size = SIZES.find(({id}) => id === selectedSizeId);

            if (size.id === "custom") {
                elements.sizeCustom.removeAttribute('hidden');
                const [width, height] = getCurrentSize();
                elements.width.value = width;
                elements.height.value = height;
            } else {
                elements.sizeCustom.setAttribute('hidden', 'hidden');
                this._notifyOnChange(size.value);
            }
        });

        elements.sizeCustom.addEventListener("focusin", e => {
            e.target.select();
        });

        elements.sizeCustom.addEventListener('input', () => {
            this._notifyOnChange([
                elements.width.value ? parseInt(elements.width.value) : null,
                elements.height.value ? parseInt(elements.height.value) : null
            ]);
        });
    }

    _notifyOnChange([width, height] = []) {
        this.element.dispatchEvent(new CustomEvent('sizechange', { detail: { width, height }}));
    }
}
