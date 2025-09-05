import * as styles from 'bundle-text:./DownloadDialog.css';
import * as html from 'bundle-text:./DownloadDialog.html';
import type ConfirmDialog from '../ConfirmDialog';
import type StringArt from '../../../StringArt';
import {
  cmDimensionsToInch,
  sizeConvert,
  STANDARD_SIZES_CM,
} from '../../../helpers/size_utils';
import { Dimensions, SizeUnit } from '../../../types/general.types';
import preferences from '../../../helpers/preferences';
import {
  downloadPattern,
  DownloadPatternOptions,
  ImageType,
} from '../../../download/Download';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

const SMALL_SCREEN_DIMENSION = Math.min(screen.width, screen.height);
const DEFAULT_DPI = 300;

const SIZES: ReadonlyArray<{
  id: string;
  name?: string;
  dimensions?:
    | Dimensions
    | ((options: { customDimensions: Dimensions | null }) => Dimensions | null);
  units?: SizeUnit[];
  aspectRatio?: number;
  allowSizeEdit?: boolean;
  defaultUnits?: SizeUnit;
}> = [
  {
    id: 'square',
    name: 'Square',
    dimensions: [SMALL_SCREEN_DIMENSION, SMALL_SCREEN_DIMENSION],
    units: ['px', 'cm', 'inch'],
    defaultUnits: 'px',
    aspectRatio: 1,
    allowSizeEdit: true,
  },
  {
    id: 'screen',
    name: 'Screen size',
    dimensions: () => {
      const dpr = window.devicePixelRatio ?? 1;
      return [window.screen.width, window.screen.height].map(v =>
        Math.floor(v * dpr)
      ) as Dimensions;
    },
    units: ['px'],
  },
  ...STANDARD_SIZES_CM.map(size => ({
    ...size,
    units: ['cm', 'inch'] as SizeUnit[],
  })),
  {
    id: 'custom',
    name: 'Custom size…',
    dimensions: ({ customDimensions }) => customDimensions,
    allowSizeEdit: true,
  },
];

type Units = SizeUnit;
const DEFAULT_DIMENSIONS: Dimensions = [10, 10];

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
    widthAndHeight: HTMLElement;
    widthAndHeightDisplay: HTMLElement;
    renderNumbersBlock: HTMLElement;
  };
  private units: Units;
  private customDimensions = DEFAULT_DIMENSIONS;
  private dimensions: Dimensions;
  private aspectRatio: number;

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
      widthAndHeight: shadow.querySelector('#width_and_height'),
      widthAndHeightDisplay: shadow.querySelector('#width_and_height_display'),
      renderNumbersBlock: shadow.querySelector('#render_numbers_block'),
    };

    this.#setSizes();
    this.setSize(SIZES[0].id);

    preferences.addEventListener('unitsChange', units => {
      if (this.units !== 'px') {
        this.setUnits(units);
      }
    });

    shadow.addEventListener('focusin', e => {
      if (
        e.target instanceof HTMLInputElement &&
        (e.target.type === 'text' || e.target.type === 'number')
      ) {
        e.target.select();
      }
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

      if (
        e.target instanceof HTMLInputElement &&
        e.target.type === 'radio' &&
        e.target.name === 'type'
      ) {
        const selectedType = (
          this.elements.form.querySelector(
            'input[name="type"]:checked'
          ) as HTMLInputElement
        )?.value;
        this.#toggleNailNumbers(selectedType === 'nails_map');
      }
    });

    shadow.addEventListener('input', e => {
      if (this.aspectRatio) {
        if (e.target === this.elements.width) {
          this.elements.height.value = String(
            Number(this.elements.width.value) * this.aspectRatio
          );
        } else if (e.target === this.elements.height) {
          this.elements.width.value = String(
            Number(this.elements.height.value) / this.aspectRatio
          );
        }
      }
    });
  }

  #setSizes() {
    this.elements.size.innerHTML = SIZES.map(
      ({ id, name }) => `<option value="${id}">${name ?? id}</option>`
    ).join('\n');
  }

  #toggleNailNumbers(show: boolean) {
    if (show) {
      this.elements.renderNumbersBlock.classList.remove('hidden');
    } else {
      this.elements.renderNumbersBlock.classList.add('hidden');
    }
  }

  setUnits(units: Units) {
    if (units === this.units) {
      return;
    }

    const prevUnits = this.units;
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

    // If changing from length unit to px or vice-versa, need to convert dimensions
    if (prevUnits && this.dimensions) {
      this.dimensions = sizeConvert(
        this.dimensions,
        prevUnits,
        units,
        Number(this.elements.dpi.value ?? DEFAULT_DPI)
      );
    }

    if (this.dimensions) {
      this.setDimensions(this.dimensions);
    }
  }

  setSize(id: string) {
    const {
      units,
      dimensions: sizeDimensions,
      aspectRatio,
      allowSizeEdit,
      defaultUnits,
    } = SIZES.find(({ id: sizeId }) => sizeId === id);

    this.aspectRatio = aspectRatio;
    const dimensions: Dimensions =
      sizeDimensions instanceof Function
        ? sizeDimensions({ customDimensions: this.customDimensions })
        : sizeDimensions;

    if (allowSizeEdit) {
      this.elements.widthAndHeight.classList.add('inputs');
    } else {
      this.elements.widthAndHeight.classList.remove('inputs');
    }

    const isPixelsOnly = units && units.length === 1 && units[0] === 'px';
    this.togglePixels(!units || units.includes('px'));
    this.setPixelsOnly(isPixelsOnly);
    this.setUnits(
      defaultUnits ??
        (isPixelsOnly ? 'px' : preferences.getUserPreferredUnits())
    );

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

  #getDimensionsById(id: string): Dimensions {
    const { dimensions } = SIZES.find(({ id: sizeId }) => sizeId === id);

    return dimensions instanceof Function
      ? dimensions({ customDimensions: this.customDimensions })
      : dimensions;
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
    this.elements.width.value = String(dimensions[0]);
    this.elements.height.value = String(dimensions[1]);
    this.elements.widthAndHeightDisplay.textContent = `${dimensions[0]} × ${dimensions[1]}`;
  }

  /**
   * Opens the dialog, optionally with an initial value.
   */
  async show(pattern: StringArt): Promise<void> {
    return this.dialog.show().then(async () => {
      const data = new FormData(this.elements.form);
      const values = Object.fromEntries(data.entries());
      console.log('VAL', values);
      await downloadPattern(pattern, this.#formValuesToDownloadOptions(values));
    });
  }

  #formValuesToDownloadOptions(
    values: Record<string, FormDataEntryValue>
  ): DownloadPatternOptions {
    const options: DownloadPatternOptions = {
      size: this.#getDimensionsById(values.size as string),
      type: values.format === 'svg' ? 'svg' : 'canvas',
      imageType: values.format === 'svg' ? null : (values.format as ImageType),
      isNailsMap: values.type === 'nails_map',
      units: (values.unit ?? 'px') as SizeUnit,
      dpi: Number(values.dpi),
      margin: Number(values.margin),
      includeNailNumbers:
        values.type === 'nails_map' && values.render_numbers === 'on',
    };

    return options;
  }
}

customElements.define('download-dialog', DownloadDialog);
