const sizeControls = document.querySelector('#size_controls');

const elements = {
  sizeSelect: sizeControls.querySelector('#size_select'),
  sizeCustom: sizeControls.querySelector('#size_custom'),
  width: sizeControls.querySelector('#size_custom_width'),
  height: sizeControls.querySelector('#size_custom_height'),
  orientationSelect: sizeControls.querySelector('#size_orientation_select'),
};

function cmToPixels(cm, dpi = 300) {
  return Math.floor((cm / 2.54) * dpi);
}

const SCREEN_SIZE = [
  Math.floor(window.screen.width),
  Math.floor(window.screen.height),
];

const SIZES = [
  { id: 'fit', name: 'Fit to screen' },
  {
    id: 'A4',
    value: [20, 28].map(v => cmToPixels(v)),
    orientationSelect: true,
  },
  {
    id: 'A3',
    value: [28, 40].map(v => cmToPixels(v)),
    orientationSelect: true,
  },
  {
    id: 'screen',
    name: `Screen size (${SCREEN_SIZE.join('x')})`,
    value: SCREEN_SIZE,
  },
  { id: 'custom', name: 'Custom...' },
];

export default class EditorSizeControls {
  element = document.querySelector('#size_controls');

  constructor({ getCurrentSize }) {
    const sizeOptionsFragment = document.createDocumentFragment();
    SIZES.forEach(size => {
      const sizeListItem = document.createElement('option');
      sizeListItem.setAttribute('value', size.id);
      sizeListItem.innerText = size.name ?? size.id;
      sizeOptionsFragment.appendChild(sizeListItem);
    });
    elements.sizeSelect.appendChild(sizeOptionsFragment);
    this.selectedSize = SIZES[0];

    elements.sizeSelect.addEventListener('change', e => {
      const selectedSizeId = e.target.value;
      const size = SIZES.find(({ id }) => id === selectedSizeId);
      this.selectedSize = size;

      if (size.id === 'custom') {
        elements.sizeCustom.removeAttribute('hidden');
        const [width, height] = getCurrentSize();
        elements.width.value = width;
        elements.height.value = height;
      } else {
        elements.sizeCustom.setAttribute('hidden', 'hidden');
        this._notifyOnChange(this.getValue());
      }

      if (size.orientationSelect) {
        elements.orientationSelect.removeAttribute('hidden');
      } else {
        elements.orientationSelect.setAttribute('hidden', 'hidden');
      }
    });

    elements.orientationSelect.addEventListener('change', e => {
      this._notifyOnChange(this.getValue());
    });

    elements.sizeCustom.addEventListener('focusin', e => {
      e.target.select();
    });

    elements.sizeCustom.addEventListener('input', () => {
      this._notifyOnChange([
        elements.width.value ? parseInt(elements.width.value) : null,
        elements.height.value ? parseInt(elements.height.value) : null,
      ]);
    });
  }

  _notifyOnChange([width, height] = []) {
    this.element.dispatchEvent(
      new CustomEvent('sizechange', { detail: { width, height } })
    );
  }

  getValue() {
    if (this.selectedSize.id === 'custom') {
      return [
        parseInt(elements.width.value, 10),
        parseInt(elements.height.value, 10),
      ];
    } else {
      let value = this.selectedSize.value;
      if (
        this.selectedSize.orientationSelect &&
        elements.orientationSelect.value === 'horizontal'
      ) {
        value = Array.from(value).reverse();
      }
      return value;
    }
  }
}
