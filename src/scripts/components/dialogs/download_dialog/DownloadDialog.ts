import * as styles from 'bundle-text:./DownloadDialog.css';
import * as html from 'bundle-text:./DownloadDialog.html';
import type ConfirmDialog from '../ConfirmDialog';
import type StringArt from '../../../StringArt';
import {
  cmDimensionsToInch,
  STANDARD_SIZES_CM,
} from '../../../helpers/size_utils';
import { Dimensions, LengthUnit } from '../../../types/general.types';
import preferences from '../../../helpers/preferences';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

const SIZES = [
  ...STANDARD_SIZES_CM,
  {
    id: 'screen',
    name: 'Screen size',
    dimensions: null,
  },
  { id: 'custom', name: 'Custom size…', dimensions: null },
];

type Units = LengthUnit | 'px';
const DEFAULT_DIMENSIONS: Dimensions = [1000, 1000];

export default class DownloadDialog extends HTMLElement {
  private dialog: ConfirmDialog;
  private elements: {
    size: HTMLSelectElement;
    form: HTMLFormElement;
    unitSelect: NodeListOf<HTMLSelectElement>;
    dpi: HTMLSelectElement;
    dpiBlock: HTMLElement;
    width: HTMLInputElement;
    height: HTMLInputElement;
  };
  private units: Units;
  private customDimensions = DEFAULT_DIMENSIONS;
  private dimensions: Dimensions;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [sheet];
    this.shadowRoot!.innerHTML = String(html);

    this.dialog = shadow.querySelector('confirm-dialog')!;
    this.elements = {
      size: shadow.querySelector('#size'),
      form: shadow.querySelector('form'),
      unitSelect: shadow.querySelectorAll('.unit-select'),
      dpi: shadow.querySelector('#dpi'),
      dpiBlock: shadow.querySelector('#dpi_block'),
      width: shadow.querySelector('#width'),
      height: shadow.querySelector('#height'),
    };

    this.#setSizes();
    this.setSize(SIZES[0].id);

    this.units = preferences.getUserPreferredUnits();
    preferences.addEventListener('unitsChange', units => {
      this.setUnits(units);
    });

    shadow.addEventListener('change', e => {
      if (
        e.target instanceof HTMLSelectElement &&
        e.target.classList.contains('unit-select')
      ) {
        this.setUnits(e.target.value as Units);
      }

      if (e.target === this.elements.size) {
        this.setSize(this.elements.size.value);
      }
    });
  }

  #setSizes() {
    this.elements.size.innerHTML = SIZES.map(
      ({ id, name }) => `<option value="${id}">${name ?? id}</option>`
    ).join('\n');
  }

  setUnits(units: Units) {
    this.units = units;

    this.elements.unitSelect.forEach(unitSelect => {
      unitSelect.value = units;
    });

    if (units === 'cm' || units === 'inch') {
      preferences.setUserPreferredUnits(units);
      this.elements.dpiBlock.classList.remove('hidden');
    } else {
      this.elements.dpiBlock.classList.add('hidden');
    }

    if (this.dimensions) {
      this.setDimensions(this.dimensions);
    }
  }

  setSize(id: string) {
    let dimensions: Dimensions = [0, 0];

    if (id === 'screen') {
      this.setUnits('px');
      const dpr = window.devicePixelRatio ?? 1;
      dimensions = [window.screen.width, window.screen.height].map(v =>
        Math.floor(v * dpr)
      ) as Dimensions;
      this.setPixelsOnly(true);
    } else if (id === 'custom') {
      dimensions = this.customDimensions;
      this.togglePixels(true);
      this.setPixelsOnly(false);
    } else {
      dimensions = SIZES.find(({ id: sizeId }) => sizeId === id)!.dimensions;
      this.setUnits(preferences.getUserPreferredUnits());
      this.togglePixels(false);
      this.setPixelsOnly(false);
    }
    this.dimensions = dimensions;
    this.setDimensions(dimensions);
  }

  togglePixels(showPixels: boolean) {
    this.elements.unitSelect.forEach(el => {
      const pixelsOption = el.querySelector('[value="px"]');
      if (showPixels) {
        pixelsOption!.removeAttribute('hidden');
      } else {
        pixelsOption!.setAttribute('hidden', 'hidden');
      }
    });
  }

  setPixelsOnly(isPixelsOnly: boolean) {
    if (isPixelsOnly) {
      this.togglePixels(true);
    }
    this.elements.unitSelect.forEach(el => {
      if (isPixelsOnly) {
        el.setAttribute('disabled', 'disabled');
      } else {
        el.removeAttribute('disabled');
      }

      const nonPixelOptions = el.querySelectorAll(':not([value="px"])');
      nonPixelOptions.forEach(option =>
        isPixelsOnly
          ? option.setAttribute('hidden', 'hidden')
          : option.removeAttribute('hidden')
      );
    });
  }

  setDimensions(dimensions: Dimensions) {
    this.dimensions = dimensions;
    const displayValue =
      this.units === 'inch' ? cmDimensionsToInch(dimensions) : dimensions;
    this.elements.width.value = String(displayValue[0]);
    this.elements.height.value = String(displayValue[1]);
  }

  /**
   * Opens the dialog, optionally with an initial value.
   */
  async show(pattern: StringArt): Promise<void> {
    return this.dialog.show().then(() => {
      const data = new FormData(this.elements.form);
      const values = Object.fromEntries(data.entries());
      console.log('VAL', values);
    });
  }
}

customElements.define('download-dialog', DownloadDialog);
