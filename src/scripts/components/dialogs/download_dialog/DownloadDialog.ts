import * as styles from 'bundle-text:./DownloadDialog.css';
import * as html from 'bundle-text:./DownloadDialog.html';
import type ConfirmDialog from '../ConfirmDialog';
import type StringArt from '../../../StringArt';
import {
  fitInside,
  lengthConvert,
  mapDimensions,
  sizeConvert,
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
import {
  DOWNLOAD_IMAGE_SIZES,
  DownloadSizeType,
  getDownloadImageSizeById,
} from './download_image_sizes';
import Persistance from '../../../Persistance';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

const DEFAULT_DPI = 300;
const IMAGE_TYPES_WITH_TRANSPARENT_BACKGROUND = ['png', 'svg', 'webp'];

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
    transparentBackground: StringArtCheckbox;
    rotateBtn: HTMLButtonElement;
  };
  private units: Units;
  private customDimensions: Dimensions;
  private dimensions: Dimensions;
  private margin: number;
  private patternAspectRatio = 1;
  private currentSize: DownloadSizeType;
  currentPattern: StringArt;
  private unitFloatingPointsPrecision = 0;

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
      transparentBackground: shadow.querySelector('#transparent_background'),
      rotateBtn: shadow.querySelector('#rotate_btn'),
    };

    this.#setSizes();
    this.setSize(DOWNLOAD_IMAGE_SIZES[0].id);

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
        )?.value as 'all' | 'nails_map';
        this.setType(selectedType);
      }

      if (
        e.target instanceof HTMLElement &&
        e.target.dataset.updatesPreview != null
      ) {
        this.updatePreview();
      }

      if (e.target instanceof HTMLSelectElement && e.target.id === 'format') {
        this.setImageType(e.target.value as ImageType | 'svg');
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
          this.setDimensions(dimensions);
          this.elements.patternDimensions.setMaxDimensions(dimensions);
          this.elements.patternDimensions[dimension] = value - this.margin * 2;
        }

        this.updatePreview();
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
            { updatePatternDimensions: false }
          );
        }
      }
    );

    this.elements.rotateBtn.addEventListener('click', () => this.rotateImage());
  }

  setType(type: 'nails_map' | 'all', updatePreview = true) {
    (
      this.shadowRoot.querySelector(`#type_${type}`)! as HTMLInputElement
    ).checked = true;

    this.#toggleNailNumbers(type === 'nails_map');

    const transparentBackgroundBlock = this.shadowRoot.querySelector(
      '#transparent_background_block'
    ) as HTMLDivElement;
    if (type === 'nails_map') {
      transparentBackgroundBlock.setAttribute('hidden', 'hidden');
    } else {
      transparentBackgroundBlock.removeAttribute('hidden');
    }

    if (updatePreview) {
      this.updatePreview();
    }
  }

  setImageType(imageType: ImageType | 'svg') {
    (this.shadowRoot.querySelector('#format') as HTMLSelectElement)!.value =
      imageType;

    if (!IMAGE_TYPES_WITH_TRANSPARENT_BACKGROUND.includes(imageType)) {
      this.elements.transparentBackground.setAttribute('hidden', 'hidden');
    } else {
      this.elements.transparentBackground.removeAttribute('hidden');
    }
  }

  getFormValues(): Record<string, FormDataEntryValue> {
    const data = new FormData(this.elements.form);
    return Object.fromEntries(data.entries());
  }

  get isTransparentBackground(): boolean {
    const formValues = this.getFormValues();

    return (
      formValues.type !== 'nails_map' &&
      IMAGE_TYPES_WITH_TRANSPARENT_BACKGROUND.includes(
        String(formValues.format)
      ) &&
      formValues.transparent_background === 'on'
    );
  }

  #setSizes() {
    this.elements.size.innerHTML = DOWNLOAD_IMAGE_SIZES.map(
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

  rotateImage() {
    this.setDimensions(this.#swapDimensions(this.dimensions));
  }

  setUnits(units: Units, updatePreview = true) {
    if (units === this.units) {
      return;
    }

    const prevUnits = this.units;
    this.units = units;

    this.elements.unitSelect.forEach(unitSelect => {
      unitSelect.value = units;
    });

    this.unitFloatingPointsPrecision = units === 'px' ? 0 : 1;

    if (units === 'cm' || units === 'inch') {
      preferences.setUserPreferredUnits(units);
      this.elements.dpiBlock.classList.remove('hidden');
    } else {
      this.elements.dpiBlock.classList.add('hidden');
    }

    this.elements.patternDimensions.setFloatingPoints(
      this.unitFloatingPointsPrecision
    );
    this.elements.imageDimensions.setFloatingPoints(
      this.unitFloatingPointsPrecision
    );

    // If changing from length unit to px or vice-versa, need to convert dimensions
    if (prevUnits) {
      if (this.dimensions) {
        this.dimensions = sizeConvert(
          this.dimensions,
          prevUnits,
          units,
          this.dpi
        );
      }

      if (this.margin) {
        this.setMargin(lengthConvert(this.margin, prevUnits, units, this.dpi));
      }
    }

    if (this.dimensions) {
      this.setDimensions(this.dimensions, updatePreview);
    }
  }

  getMarginMax(): number | null {
    if (this.dimensions) {
      return Math.min(this.dimensions[0] / 2.1, this.dimensions[1] / 2.1);
    }

    return null;
  }

  setMargin(
    margin: number | null,
    { updatePatternDimensions = true, updatePreview = true } = {}
  ) {
    margin = Math.max(margin, 0);
    if (this.dimensions) {
      margin = Math.min(margin, this.getMarginMax());
    }
    if (margin === this.margin) {
      return;
    }

    this.margin = margin ?? 0;
    this.elements.margin.value = String(
      margin.toFixedPrecision(this.unitFloatingPointsPrecision) ?? 0
    );

    if (updatePatternDimensions && this.dimensions) {
      this.updatePatternDimensions();
    }

    if (updatePreview) {
      this.updatePreview();
    }
  }

  setSize(id: string, updatePreview = true) {
    const size = getDownloadImageSizeById(id);
    this.currentSize = size;

    const {
      units,
      dimensions: sizeDimensions,
      aspectRatio,
      allowSizeEdit,
      defaultUnits,
      inUnits,
      defaultMargin = 0,
      allowRotate,
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

    if (allowRotate) {
      this.elements.rotateBtn.removeAttribute('hidden');
    } else {
      this.elements.rotateBtn.setAttribute('hidden', 'hidden');
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

    this.setDimensions(dimensions, updatePreview);

    if (updatePreview) {
      this.updatePreview();
    }

    this.elements.size.value = id;
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

  #getDimensionsBySizeId(id: string): Dimensions {
    const { dimensions } = getDownloadImageSizeById(id);

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

  setDimensions(dimensions: Dimensions, updatePreview = true) {
    this.dimensions = dimensions;
    this.elements.imageDimensions.width = dimensions[0];
    this.elements.imageDimensions.height = dimensions[1];

    this.elements.canvas.style.removeProperty('width');
    this.elements.canvas.style.removeProperty('height');

    this.elements.margin.setAttribute('max', String(this.getMarginMax()));

    this.updatePatternDimensions();

    if (updatePreview) {
      this.updatePreview();
    }
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

  #swapDimensions(dimensions: Dimensions): Dimensions {
    return [dimensions[1], dimensions[0]];
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
    return this.dialog
      .show(() => {
        const savedDownloadOptions = Persistance.getPatternDownloadData(
          pattern.id
        );
        this.setDownloadOptionsToForm(savedDownloadOptions);
      })
      .then(async () => {
        const values = this.getFormValues();
        const downloadOptions = this.#formValuesToDownloadOptions(
          values,
          pattern
        );
        Persistance.savePatternDownloadData(pattern.id, downloadOptions);

        await downloadPattern(pattern, downloadOptions);
      });
  }

  #formValuesToDownloadOptions(
    values: Record<string, FormDataEntryValue>,
    pattern: StringArt
  ): DownloadPatternOptions {
    const isNailsMap = values.type === 'nails_map';

    let dimensions = this.#getDimensionsBySizeId(values.size as string);
    if (values.rotate_image) {
      dimensions = this.#swapDimensions(dimensions);
    }
    const options: DownloadPatternOptions = {
      size: dimensions,
      type: values.format === 'svg' ? 'svg' : 'canvas',
      imageType: values.format === 'svg' ? null : (values.format as ImageType),
      isNailsMap: isNailsMap,
      units: (values.unit ?? 'px') as SizeUnit,
      dpi: Number(values.dpi),
      margin: Number(values.margin),
      includeNailNumbers: isNailsMap && values.render_numbers === 'on',
      filename: isNailsMap ? `${pattern.name} - nail map` : pattern.name,
      enableBackground: !this.isTransparentBackground,
      sizeId: String(values.size),
      isRotated: !!values.rotate_image,
    };

    return options;
  }

  /**
   * Used when loading saved download options, to populate the form and internals
   * @param downloadOptions
   */
  setDownloadOptionsToForm(downloadOptions: DownloadPatternOptions | null) {
    if (!downloadOptions) {
      const size = DOWNLOAD_IMAGE_SIZES[0];
      downloadOptions = {
        size:
          size.dimensions instanceof Function
            ? size.dimensions({
                patternAspectRatio: this.patternAspectRatio,
              })
            : size.dimensions,
        sizeId: size.id,
        margin: size.defaultMargin,
        units: size.defaultUnits,
      };
    }
    this.setType(downloadOptions.isNailsMap ? 'nails_map' : 'all', false);

    this.#toggleNailNumbers(downloadOptions.isNailsMap);
    (this.shadowRoot.querySelector(
      '#render_numbers'
    ) as StringArtCheckbox)!.value =
      downloadOptions.includeNailNumbers === true;

    const sizeId = downloadOptions.sizeId ?? 'custom';
    this.setSize(sizeId, false);

    const isRotated = downloadOptions.isRotated === true;
    (
      this.shadowRoot.querySelector('#rotate_image') as HTMLInputElement
    ).checked = isRotated;
    if (isRotated) {
      this.rotateImage();
    }

    if (downloadOptions.units != null) {
      this.setUnits(downloadOptions.units, false);
    }

    this.setMargin(downloadOptions.margin ?? 0, { updatePreview: false });
    const { size } = downloadOptions;
    if (getDownloadImageSizeById(sizeId).allowSizeEdit) {
      this.customDimensions = size;
      this.setDimensions(size, false);
    }

    this.elements.dpi.value = String(downloadOptions.dpi ?? DEFAULT_DPI);

    this.setImageType(downloadOptions.imageType ?? 'png');

    (this.shadowRoot.querySelector(
      '#transparent_background'
    ) as StringArtCheckbox)!.value = !downloadOptions.enableBackground;

    this.updatePreview();
  }

  updatePreview() {
    if (!this.currentPattern || !this.elements.canvas.clientWidth) {
      return;
    }

    this.elements.canvas.innerHTML = '';

    if (this.elements.canvas.clientWidth) {
      const pxDimensions = fitInside(
        sizeConvert(this.dimensions, this.units, 'px', this.dpi),
        [
          this.elements.canvas.clientWidth || 200,
          this.elements.canvas.clientHeight || 300,
        ]
      );
      this.elements.canvas.style.width = pxDimensions[0] + 'px';
      this.elements.canvas.style.height = pxDimensions[1] + 'px';
    }

    const renderer = new CanvasRenderer(this.elements.canvas, {
      updateOnResize: false,
    });

    const previewSize = [
      this.elements.canvas.clientWidth || 200,
      this.elements.canvas.clientHeight || 300,
    ] as Dimensions;

    renderer.setFixedSize(previewSize);

    const previewPattern = this.currentPattern.copy();
    const values = this.getFormValues();

    previewPattern.assignConfig(
      values.type === 'nails_map'
        ? {
            darkMode: false,
            showNails: true,
            showNailNumbers: values.render_numbers === 'on',
            showStrings: false,
            nailsColor: '#000000',
            backgroundColor: '#ffffff',
            enableBackground: true,
          }
        : {
            enableBackground: !this.isTransparentBackground,
          }
    );

    previewPattern.assignConfig({
      margin: Math.floor((this.margin / this.dimensions[0]) * previewSize[0]),
    });

    previewPattern.draw(renderer);
  }
}

customElements.define('download-dialog', DownloadDialog);
