import * as styles from 'bundle-text:./DownloadDialog.css';
import * as html from 'bundle-text:./DownloadDialog.html';
import type ConfirmDialog from '../ConfirmDialog';
import type StringArt from '../../../StringArt';
import {
  fitInside,
  lengthConvert,
  mapDimensions,
  sizeConvert,
  STANDARD_SIZES_CM,
} from '../../../helpers/size_utils';
import { Dimension, Dimensions, SizeUnit } from '../../../types/general.types';
import preferences from '../../../helpers/preferences';
import {
  downloadPattern,
  DownloadPatternOptions,
  ImageType,
} from '../../../download/Download';
import type DimensionsInput from '../../inputs/DimensionsInput';
import CanvasRenderer from '../../../renderers/CanvasRenderer';
import StringArtCheckbox from '../../inputs/StringArtCheckbox';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

const DEFAULT_DPI = 300;
const DEFAULT_DIMENSIONS: Dimensions = [10, 10];

interface SizeType {
  id: string;
  name?: string;
  dimensions?:
    | Dimensions
    | ((options: {
        customDimensions: Dimensions | null;
        currentDimensions: Dimensions | null;
        patternAspectRatio: number;
      }) => Dimensions | null);
  units?: SizeUnit[];
  aspectRatio?:
    | number
    | ((options: { patternAspectRatio: number }) => number | null);
  allowSizeEdit?: boolean;
  defaultUnits?: SizeUnit;
  inUnits?: SizeUnit;
  defaultMargin?: number;
}

const SIZES: ReadonlyArray<SizeType> = [
  {
    id: 'fit',
    name: 'Fit pattern',
    dimensions: ({ customDimensions, patternAspectRatio }) => {
      let dimensions = customDimensions;
      if (!dimensions) {
        const SMALL_SCREEN_DIMENSION = Math.min(screen.width, screen.height);
        const dpr = window.devicePixelRatio ?? 1;
        dimensions = [SMALL_SCREEN_DIMENSION, SMALL_SCREEN_DIMENSION];
      }
      const customDimensionsFitPattern = [
        dimensions[0],
        dimensions[0] / patternAspectRatio,
      ] as Dimensions;

      return fitInside(customDimensionsFitPattern, dimensions);
    },
    units: ['px', 'cm', 'inch'],
    defaultUnits: 'px',
    defaultMargin: 10,
  },
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
    defaultMargin: 10,
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
    defaultMargin: 10,
  },
  ...STANDARD_SIZES_CM.map(size => ({
    ...size,
    units: ['cm', 'inch'] as SizeUnit[],
    inUnits: 'cm' as SizeUnit,
    defaultMargin: 1,
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
    imageDimensions: DimensionsInput;
    renderNumbersBlock: HTMLElement;
    patternDimensions: DimensionsInput;
    margin: HTMLInputElement;
    canvas: HTMLCanvasElement;
  };
  private units: Units;
  private customDimensions: Dimensions;
  private dimensions: Dimensions;
  private margin: number;
  private patternAspectRatio = 1;
  private currentSize: SizeType;
  currentPattern: StringArt;

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
      renderNumbersBlock: shadow.querySelector('#render_numbers_block'),
      patternDimensions: shadow.querySelector('#pattern_size'),
      imageDimensions: shadow.querySelector('#image_dimensions'),
      margin: shadow.querySelector('#margin'),
      canvas: shadow.querySelector('#canvas'),
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
        this.updatePreview();
      }

      if (
        e.target instanceof StringArtCheckbox &&
        e.target.id === 'render_numbers'
      ) {
        this.updatePreview();
      }
    });

    this.elements.margin.addEventListener('input', (e: InputEvent) => {
      const value = Number((e.target as HTMLInputElement).value);
      this.setMargin(isNaN(value) ? 0 : value);
    });

    this.elements.imageDimensions.addEventListener(
      'dimensionchange',
      ({
        detail: { dimension, value: dimensions, ...size },
      }: CustomEvent<{
        value: Dimensions;
        dimension: Dimension;
        width: number;
        height: number;
      }>) => {
        const value = size[dimension];

        if (this.customDimensions) {
          this.customDimensions = dimensions;
          this.elements.patternDimensions.setMaxDimensions(dimensions);
          this.elements.patternDimensions[dimension] = value - this.margin * 2;
        }
      }
    );

    this.elements.patternDimensions.addEventListener(
      'dimensionchange',
      ({
        detail: { dimension, value: dimensions, ...size },
      }: CustomEvent<{
        value: Dimensions;
        dimension: Dimension;
        width: number;
        height: number;
      }>) => {
        const value = size[dimension];

        if (this.dimensions) {
          this.setMargin(
            this.dimensions[dimension === 'width' ? 0 : 1] - value,
            false
          );
        }
      }
    );
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

  get dpi(): number {
    return Number(this.elements.dpi.value ?? DEFAULT_DPI);
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
      this.elements.patternDimensions.setFloatingPoints(1);
      this.elements.imageDimensions.setFloatingPoints(1);
    } else {
      this.elements.dpiBlock.classList.add('hidden');
      this.elements.patternDimensions.setFloatingPoints(0);
      this.elements.imageDimensions.setFloatingPoints(0);
    }

    // If changing from length unit to px or vice-versa, need to convert dimensions
    if (prevUnits) {
      if (this.dimensions) {
        this.dimensions = mapDimensions(
          sizeConvert(this.dimensions, prevUnits, units, this.dpi),
          v => v.toFixedPrecision(1)
        );
      }

      if (this.margin) {
        this.setMargin(lengthConvert(this.margin, prevUnits, units, this.dpi));
      }
    }

    if (this.dimensions) {
      this.setDimensions(this.dimensions);
    }
  }

  setMargin(margin: number | null, updatePatternDimensions = true) {
    margin = Math.max(margin, 0);

    if (margin === this.margin) {
      return;
    }

    this.margin = margin ?? 0;
    this.elements.margin.value = String(margin ?? 0);

    if (updatePatternDimensions && this.dimensions) {
      this.updatePatternDimensions();
    }

    this.updatePreview();
  }

  setSize(id: string) {
    const size = SIZES.find(({ id: sizeId }) => sizeId === id);
    this.currentSize = size;

    const {
      units,
      dimensions: sizeDimensions,
      aspectRatio,
      allowSizeEdit,
      defaultUnits,
      inUnits,
      defaultMargin = 0,
    } = size;

    this.elements.imageDimensions.aspectRatio =
      aspectRatio instanceof Function
        ? aspectRatio({
            patternAspectRatio: this.patternAspectRatio,
          })
        : aspectRatio;

    let dimensions: Dimensions =
      sizeDimensions instanceof Function
        ? sizeDimensions({
            customDimensions: this.customDimensions,
            currentDimensions: this.dimensions,
            patternAspectRatio: this.patternAspectRatio,
          })
        : sizeDimensions;

    if (allowSizeEdit) {
      this.elements.imageDimensions.isReadonly = false;
      this.customDimensions = dimensions;
    } else {
      this.elements.imageDimensions.isReadonly = true;
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
        sizeConvert(dimensions, inUnits, newUnits, this.dpi),
        v => v.toFixedPrecision(1)
      );
    }

    if (defaultMargin) {
      this.setMargin(defaultMargin);
    }

    this.setDimensions(dimensions);
    this.updatePreview();
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
          patternAspectRatio: this.patternAspectRatio,
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
    this.elements.imageDimensions.width = dimensions[0];
    this.elements.imageDimensions.height = dimensions[1];

    const pxDimensions = fitInside(
      sizeConvert(dimensions, this.units, 'px', this.dpi),
      [200, 300]
    );
    this.elements.canvas.style.width = pxDimensions[0] + 'px';
    this.elements.canvas.style.height = pxDimensions[1] + 'px';

    this.updatePatternDimensions();
    this.updatePreview();
  }

  updatePatternDimensions() {
    const patternDimensions = this.#getPatternDimensions();
    this.elements.patternDimensions.maxWidth = this.dimensions[0];
    this.elements.patternDimensions.maxHeight = this.dimensions[1];
    this.elements.patternDimensions.width = patternDimensions[0];
    this.elements.patternDimensions.height = patternDimensions[1];
  }

  #getPatternDimensions(): Dimensions {
    const width = this.dimensions[0] - this.margin * 2;
    const patternAvailableDimensions = mapDimensions(
      this.dimensions,
      v => v - this.margin * 2
    );

    if (!this.patternAspectRatio || isNaN(this.patternAspectRatio)) {
      return patternAvailableDimensions;
    }

    const patternDimensions = [
      width,
      width / this.patternAspectRatio,
    ] as Dimensions;
    return fitInside(
      patternDimensions,
      mapDimensions(this.dimensions, v => v - this.margin * 2)
    );
  }

  /**
   * Opens the dialog, optionally with an initial value.
   */
  async show(pattern: StringArt): Promise<void> {
    this.currentPattern = pattern;
    this.patternAspectRatio = pattern.getAspectRatio({ size: this.dimensions });
    this.elements.patternDimensions.setAttribute(
      'aspect-ratio',
      String(this.patternAspectRatio)
    );

    this.setSize(this.currentSize.id);
    this.updatePreview();
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

  updatePreview() {
    if (!this.currentPattern) {
      return;
    }

    this.elements.canvas.innerHTML = '';
    const renderer = new CanvasRenderer(this.elements.canvas, {
      updateOnResize: false,
    });

    const previewSize = [
      this.elements.canvas.clientWidth || 200,
      this.elements.canvas.clientHeight || 300,
    ] as Dimensions;

    renderer.setFixedSize(previewSize);

    const previewPattern = this.currentPattern.copy();
    previewPattern.config = {
      margin: (this.margin / this.dimensions[0]) * previewSize[0],
    };

    if (previewPattern.config.enableBackground) {
      this.elements.canvas.style.setProperty(
        'background',
        previewPattern.config.backgroundColor
      );
    } else {
      this.elements.canvas.style.removeProperty('background');
    }

    const data = new FormData(this.elements.form);
    const values = Object.fromEntries(data.entries());

    if (values.type === 'nails_map') {
      previewPattern.config = {
        ...previewPattern.config,
        darkMode: false,
        showNails: true,
        showNailNumbers: values.render_numbers === 'on',
        showStrings: false,
        nailsColor: '#000000',
        backgroundColor: '#ffffff',
      };
    }
    previewPattern.draw(renderer);
  }
}

customElements.define('download-dialog', DownloadDialog);
