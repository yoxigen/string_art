import * as styles from 'bundle-text:./DownloadDialog.css';
import * as html from 'bundle-text:./DownloadDialog.html';
import type ConfirmDialog from '../ConfirmDialog';
import type StringArt from '../../../StringArt';
import {
  fitInside,
  mapDimensions,
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
import type DimensionsInput from '../../inputs/DimensionsInput';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

const DEFAULT_DPI = 300;
const DEFAULT_DIMENSIONS: Dimensions = [10, 10];

const SIZES: ReadonlyArray<{
  id: string;
  name?: string;
  dimensions?:
    | Dimensions
    | ((options: {
        customDimensions: Dimensions | null;
        currentDimensions: Dimensions | null;
      }) => Dimensions | null);
  units?: SizeUnit[];
  aspectRatio?: number;
  allowSizeEdit?: boolean;
  defaultUnits?: SizeUnit;
  inUnits?: SizeUnit;
}> = [
  {
    id: 'square',
    name: 'Square',
    dimensions: ({ customDimensions }) => {
      if (customDimensions) {
        const smallestSize = Math.min(...customDimensions);
        return [smallestSize, smallestSize];
      }
      const SMALL_SCREEN_DIMENSION = Math.min(screen.width, screen.height);
      const dpr = window.devicePixelRatio ?? 1;
      return [SMALL_SCREEN_DIMENSION, SMALL_SCREEN_DIMENSION].map(v =>
        Math.floor(v * dpr)
      ) as Dimensions;
    },
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
    inUnits: 'cm' as SizeUnit,
  })),
  {
    id: 'custom',
    name: 'Custom size…',
    dimensions: ({ customDimensions, currentDimensions }) =>
      currentDimensions ?? customDimensions ?? DEFAULT_DIMENSIONS,
    allowSizeEdit: true,
  },
];

type Units = SizeUnit;

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
    patternSize: DimensionsInput;
  };
  private units: Units;
  private customDimensions: Dimensions;
  private dimensions: Dimensions;
  private aspectRatio: number;
  private margin = 0;
  private patternAspectRatio = 1;

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
      patternSize: shadow.querySelector('#pattern_size'),
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
      if (e.target === this.elements.width) {
        const width = Number(this.elements.width.value);
        if (this.customDimensions) {
          this.customDimensions[0] = width;
          this.elements.patternSize.maxWidth = width - this.margin;
          this.elements.patternSize.width = width - this.margin;
        }
        if (this.aspectRatio) {
          const height = width / this.aspectRatio;
          this.customDimensions[1] = height;
          this.elements.height.value = String(height);
        }
      } else if (e.target === this.elements.height) {
        const height = Number(this.elements.height.value);
        if (this.customDimensions) {
          this.customDimensions[1] = height;
          this.elements.patternSize.maxHeight = height - this.margin;
          this.elements.patternSize.height = height - this.margin;
        }
        if (this.aspectRatio) {
          const width = height * this.aspectRatio;
          this.customDimensions[1] = width;
          this.elements.width.value = String(width / this.aspectRatio);
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
      this.elements.patternSize.setFloatingPoints(1);
    } else {
      this.elements.dpiBlock.classList.add('hidden');
      this.elements.patternSize.setFloatingPoints(0);
    }

    // If changing from length unit to px or vice-versa, need to convert dimensions
    if (prevUnits && this.dimensions) {
      this.dimensions = mapDimensions(
        sizeConvert(
          this.dimensions,
          prevUnits,
          units,
          Number(this.elements.dpi.value ?? DEFAULT_DPI)
        ),
        v => v.toFixedPrecision(1)
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
      inUnits,
    } = SIZES.find(({ id: sizeId }) => sizeId === id);

    this.aspectRatio = aspectRatio;
    let dimensions: Dimensions =
      sizeDimensions instanceof Function
        ? sizeDimensions({
            customDimensions: this.customDimensions,
            currentDimensions: this.dimensions,
          })
        : sizeDimensions;

    if (allowSizeEdit) {
      this.elements.widthAndHeight.classList.add('inputs');
      this.customDimensions = dimensions;
    } else {
      this.elements.widthAndHeight.classList.remove('inputs');
    }

    const isPixelsOnly = units && units.length === 1 && units[0] === 'px';
    this.togglePixels(!units || units.includes('px'));
    this.setPixelsOnly(isPixelsOnly);
    const newUnits =
      defaultUnits ??
      (isPixelsOnly
        ? 'px'
        : units && !units.includes(this.units)
        ? preferences.getUserPreferredUnits()
        : this.units);

    this.setUnits(newUnits);
    if (inUnits && inUnits !== newUnits) {
      dimensions = mapDimensions(
        sizeConvert(
          dimensions,
          inUnits,
          newUnits,
          Number(this.elements.dpi.value)
        ),
        v => v.toFixedPrecision(1)
      );
    }
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
      ? dimensions({
          customDimensions: this.customDimensions,
          currentDimensions: this.dimensions,
        })
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

    const patternDimensions = this.#getPatternDimensions();
    this.elements.patternSize.width = patternDimensions[0];
    this.elements.patternSize.height = patternDimensions[1];
    this.elements.patternSize.maxWidth = patternDimensions[0];
    this.elements.patternSize.maxHeight = patternDimensions[1];
  }

  #getPatternDimensions(): Dimensions {
    const width = this.dimensions[0] - this.margin;

    const patternDimensions = [
      width,
      width / this.patternAspectRatio,
    ] as Dimensions;
    return fitInside(
      patternDimensions,
      mapDimensions(this.dimensions, v => v - this.margin)
    );
  }

  /**
   * Opens the dialog, optionally with an initial value.
   */
  async show(pattern: StringArt): Promise<void> {
    this.patternAspectRatio = pattern.getAspectRatio({ size: this.dimensions });
    this.elements.patternSize.setAttribute(
      'aspect-ratio',
      String(this.patternAspectRatio)
    );

    return this.dialog.show().then(async () => {
      const data = new FormData(this.elements.form);
      const values = Object.fromEntries(data.entries());
      console.log('VAL', values);
      await downloadPattern(
        pattern,
        this.#formValuesToDownloadOptions(values, pattern)
      );
    });
  }

  #formValuesToDownloadOptions(
    values: Record<string, FormDataEntryValue>,
    pattern: StringArt
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
      filename:
        values.type === 'nails_map'
          ? `${pattern.name} - nail map`
          : pattern.name,
    };

    return options;
  }
}

customElements.define('download-dialog', DownloadDialog);
