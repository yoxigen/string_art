import * as styles from 'bundle-text:./DownloadInstructionsDialog.css';
import * as html from 'bundle-text:./DownloadInstructionsDialog.html';
import type ConfirmDialog from '../ConfirmDialog';
import type StringArt from '../../../infra/StringArt';
import {
  fitInside,
  lengthConvert,
  mapDimensions,
  sizeConvert,
} from '../../../helpers/size_utils';
import {
  Dimension,
  Dimensions,
  LengthUnit,
  SizeUnit,
} from '../../../types/general.types';
import preferences from '../../../helpers/preferences';
import { downloadPattern } from '../../../download/Download';
import type DimensionsInput from '../../inputs/DimensionsInput';
import CanvasRenderer from '../../../infra/renderers/CanvasRenderer';
import StringArtCheckbox from '../../inputs/StringArtCheckbox';
import Persistance from '../../../Persistance';
import { hide, toggleHide, unHide } from '../../../helpers/dom_utils';
import posthog from 'posthog-js';
import { DownloadInstructionsOptions } from './download_instructions_types';
import { createPatternInstructions } from '../../../download/download_instructions';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

type Units = SizeUnit;

export default class DownloadInstructionsDialog extends HTMLElement {
  private dialog: ConfirmDialog;
  private elements: {
    form: HTMLFormElement;
    unitSelect: NodeListOf<HTMLSelectElement>;
    imageDimensions: DimensionsInput;
    patternDimensions: DimensionsInput;
    margin: HTMLInputElement;
    canvas: HTMLCanvasElement;
  };
  private units: LengthUnit = 'cm';
  private customDimensions: Dimensions = [30, 30];
  private dimensions: Dimensions = [30, 30];
  private margin: number;
  private patternAspectRatio = 1;

  currentPattern: StringArt;
  private unitFloatingPointsPrecision = 0;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [sheet];
    this.shadowRoot!.innerHTML = String(html);

    this.dialog = shadow.querySelector('confirm-dialog')!;
    this.elements = {
      form: shadow.querySelector('form'),
      unitSelect: shadow.querySelectorAll('.unit-select'),
      patternDimensions: shadow.querySelector('#pattern_size'),
      imageDimensions: shadow.querySelector('#image_dimensions'),
      margin: shadow.querySelector('#margin'),
      canvas: shadow.querySelector('#canvas'),
    };

    preferences.addEventListener('unitsChange', units => {
      this.setUnits(units);
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
        this.setUnits(e.target.value as LengthUnit);
      }

      if (
        e.target instanceof HTMLElement &&
        e.target.dataset.updatesPreview != null
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
  }

  getFormValues(): Record<string, FormDataEntryValue> {
    const data = new FormData(this.elements.form);
    return Object.fromEntries(data.entries());
  }

  setUnits(units: LengthUnit, updatePreview = true) {
    if (units === this.units) {
      return;
    }

    const prevUnits = this.units;
    this.units = units;

    this.elements.unitSelect.forEach(unitSelect => {
      unitSelect.value = units;
    });

    this.unitFloatingPointsPrecision = 1;

    preferences.setUserPreferredUnits(units);

    this.elements.patternDimensions.setFloatingPoints(
      this.unitFloatingPointsPrecision
    );
    this.elements.imageDimensions.setFloatingPoints(
      this.unitFloatingPointsPrecision
    );

    // If changing from length unit to px or vice-versa, need to convert dimensions
    if (prevUnits) {
      if (this.dimensions) {
        this.dimensions = sizeConvert(this.dimensions, prevUnits, units);
      }

      if (this.margin) {
        this.setMargin(lengthConvert(this.margin, prevUnits, units));
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

  // setSize(id: string, updatePreview = true) {

  //   this.elements.imageDimensions.aspectRatio =
  //     aspectRatio instanceof Function
  //       ? aspectRatio({
  //           patternAspectRatio: this.patternAspectRatio,
  //         })
  //       : aspectRatio;

  //   let dimensions: Dimensions =
  //     sizeDimensions instanceof Function
  //       ? sizeDimensions({
  //           customDimensions: this.customDimensions,
  //           currentDimensions: this.dimensions,
  //           patternAspectRatio: this.patternAspectRatio,
  //         })
  //       : sizeDimensions;

  //   if (allowSizeEdit) {
  //     this.elements.imageDimensions.isReadonly = false;
  //     this.customDimensions = dimensions;
  //   } else {
  //     this.elements.imageDimensions.isReadonly = true;
  //   }

  //   const newUnits =
  //     defaultUnits ??
  //     (units && !units.includes(this.units)
  //       ? preferences.getUserPreferredUnits()
  //       : this.units);

  //   this.setUnits(newUnits);
  //   if (inUnits && inUnits !== newUnits) {
  //     dimensions = mapDimensions(
  //       sizeConvert(dimensions, inUnits, newUnits),
  //       v => v.toFixedPrecision(1)
  //     );
  //   }

  //   if (defaultMargin) {
  //     this.setMargin(defaultMargin);
  //   }

  //   this.setDimensions(dimensions, updatePreview);

  //   if (updatePreview) {
  //     this.updatePreview();
  //   }
  // }

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

  close() {
    this.dialog.close();
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

    // this.setSize(this.currentSize.id);
    return this.dialog
      .show(() => {
        const savedDownloadOptions =
          Persistance.getPatternDownloadInstructionsData(pattern.id);
        this.setDownloadOptionsToForm(savedDownloadOptions);
      })
      .then(async () => {
        const values = this.getFormValues();
        const downloadOptions = this.#formValuesToDownloadOptions(
          values,
          pattern
        );
        Persistance.savePatternDownloadInstructionsData(
          pattern.id,
          downloadOptions
        );

        const instructions = createPatternInstructions(pattern, {
          dimensions: downloadOptions.size,
        });
        // await downloadPattern(pattern, downloadOptions);
        // posthog.capture('download_instructions', {
        //   pattern: pattern.type,
        //   isTemplate: pattern.isTemplate,
        //   ...downloadOptions,
        // });
        console.log('DOWNLOAD', instructions);
      });
  }

  #formValuesToDownloadOptions(
    values: Record<string, FormDataEntryValue>,
    pattern: StringArt
  ): DownloadInstructionsOptions {
    const isNailsMap = values.type === 'nails_map';

    const options: DownloadInstructionsOptions = {
      size: [100, 100],
      margin: 1,
      type: 'txt',
      filename: isNailsMap ? `${pattern.name} - instructions` : pattern.name,
      includeNailPositions: true,
      includeInstructions: true,
      colorFormat: 'rgb',
    };

    return options;
  }

  /**
   * Used when loading saved download options, to populate the form and internals
   * @param downloadOptions
   */
  setDownloadOptionsToForm(
    downloadOptions: DownloadInstructionsOptions | null
  ) {
    if (!downloadOptions) {
      downloadOptions = {
        size: [30, 30],
        margin: 1,
        type: 'txt',
        includeNailPositions: true,
        includeInstructions: true,
        colorFormat: 'rgb',
      };
    }

    if (downloadOptions.units != null) {
      this.setUnits(downloadOptions.units, false);
    }

    this.setMargin(downloadOptions.margin ?? 0, { updatePreview: false });
    const { size } = downloadOptions;
    this.customDimensions = size;
    this.setDimensions(size, false);
    this.updatePreview();
  }

  updatePreview() {
    if (!this.currentPattern || !this.elements.canvas.clientWidth) {
      return;
    }

    this.elements.canvas.innerHTML = '';
    const dimensionsInPx = sizeConvert(this.dimensions, this.units, 'px', 300);
    if (this.elements.canvas.clientWidth) {
      const pxDimensions = fitInside(dimensionsInPx, [
        this.elements.canvas.clientWidth || 200,
        this.elements.canvas.clientHeight || 300,
      ]);
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

    previewPattern.assignConfig({
      showNailNumbers: false,
      showStrings: true,
    });

    const previewSizeRatio = previewSize[0] / dimensionsInPx[0];
    previewPattern.assignConfig({
      margin: Math.floor(this.margin * previewSizeRatio),
      nailRadius: Math.max(
        0.5,
        this.currentPattern.config.nailRadius * previewSizeRatio
      ),
    });

    previewPattern.draw(renderer);
  }
}

customElements.define(
  'download-instructions-dialog',
  DownloadInstructionsDialog
);
