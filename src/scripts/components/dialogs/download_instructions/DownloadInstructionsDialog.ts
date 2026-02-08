import * as styles from 'bundle-text:./DownloadInstructionsDialog.css';
import * as html from 'bundle-text:./DownloadInstructionsDialog.html';
import type ConfirmDialog from '../ConfirmDialog';
import type StringArt from '../../../infra/StringArt';
import Persistance from '../../../Persistance';
import posthog from 'posthog-js';
import { DownloadInstructionsOptions } from './download_instructions_types';
import {
  createPatternInstructions,
  Instructions,
} from '../../../download/download_instructions';
import { roundNumber } from '../../../helpers/math_utils';
import { convertColorFormat } from '../../../helpers/color_utils';
import { downloadTextFile } from '../../../download/Download';
import { ColorFormat } from '../../../helpers/color/color.types';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

export default class DownloadInstructionsDialog extends HTMLElement {
  private dialog: ConfirmDialog;
  private elements: {
    form: HTMLFormElement;
    unitSelect: NodeListOf<HTMLSelectElement>;
    output: HTMLPreElement;
  };

  currentPattern: StringArt;
  private formattedInstructions: string;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [sheet];
    this.shadowRoot!.innerHTML = String(html);

    this.dialog = shadow.querySelector('confirm-dialog')!;
    this.elements = {
      form: shadow.querySelector('form'),
      unitSelect: shadow.querySelectorAll('.unit-select'),
      output: shadow.querySelector('#output'),
    };

    shadow.addEventListener('focusin', e => {
      if (
        e.target instanceof HTMLInputElement &&
        (e.target.type === 'text' || e.target.type === 'number')
      ) {
        e.target.select();
      }
    });

    shadow.addEventListener('change', e => {
      if (e.target instanceof HTMLElement) {
        this.updatePreview();
      }
    });
  }

  getFormValues(): Record<string, FormDataEntryValue> {
    const data = new FormData(this.elements.form);
    return Object.fromEntries(data.entries());
  }

  close() {
    this.dialog.close();
  }

  /**
   * Opens the dialog, optionally with an initial value.
   */
  async show(pattern: StringArt): Promise<void> {
    this.currentPattern = pattern;

    return this.dialog
      .show(() => {
        const savedDownloadOptions =
          Persistance.getPatternDownloadInstructionsData(pattern.id);
        this.setDownloadOptionsToForm(savedDownloadOptions);
        this.updatePreview();
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

        downloadTextFile(
          this.formattedInstructions,
          `${pattern.name}.${
            downloadOptions.format === 'json' ? 'json' : 'txt'
          }`,
          downloadOptions.format === 'json' ? 'text/json' : 'text/plain'
        );
      });
  }

  #formValuesToDownloadOptions(
    values: Record<string, FormDataEntryValue>,
    pattern: StringArt
  ): DownloadInstructionsOptions {
    const isNailsMap = values.type === 'nails_map';

    const options: DownloadInstructionsOptions = {
      format: values.format === 'json' ? 'json' : 'txt',
      filename: isNailsMap ? `${pattern.name} - instructions` : pattern.name,
      includeNailPositions: true,
      includeInstructions: true,
      colorFormat: values.color as ColorFormat,
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
        format: 'json',
        includeNailPositions: true,
        includeInstructions: true,
        colorFormat: 'rgb',
      };
    }

    this.setFormat(downloadOptions.format ?? 'json');
    this.setColorFormat(downloadOptions.colorFormat ?? 'rgb');
    this.updatePreview();
  }

  setFormat(format: 'json' | 'txt', updatePreview = true) {
    (
      this.shadowRoot.querySelector(`#format_${format}`)! as HTMLInputElement
    ).checked = true;

    if (updatePreview) {
      this.updatePreview();
    }
  }

  setColorFormat(colorFormat: ColorFormat, updatePreview = true) {
    (
      this.shadowRoot.querySelector(
        `#color_${colorFormat}`
      )! as HTMLInputElement
    ).checked = true;

    if (updatePreview) {
      this.updatePreview();
    }
  }

  updatePreview() {
    const values = this.getFormValues();
    const downloadOptions = this.#formValuesToDownloadOptions(
      values,
      this.currentPattern
    );

    const instructions = createPatternInstructions(this.currentPattern, {
      dimensions: [100, 100],
      includeNails: false,
    });

    this.formattedInstructions = this.elements.output.innerHTML =
      this.formatInstructions(instructions, downloadOptions);
  }

  private formatInstructions(
    instructions: Instructions,
    options: DownloadInstructionsOptions
  ): string {
    if (options.format === 'json') {
      const layers = instructions.layers.map(layer => ({
        color: convertColorFormat(layer.color, options.colorFormat),
        points: layer.points.join(', '),
      }));
      // const nails = instructions.nails.map(nail =>
      //   nail.map(v => roundNumber(v, 1)).join(', ')
      // );
      return JSON.stringify({ layers }, null, 2).replace(
        /\"points\": \"([\d\,\s]+)\"/g,
        `"points": [$1]`
      );
    } else {
      return instructions.layers
        .map(
          layer =>
            `${convertColorFormat(
              layer.color,
              options.colorFormat
            )}\n${layer.points.join(', ')}`
        )
        .join('\n\n');
    }
  }
}

customElements.define(
  'download-instructions-dialog',
  DownloadInstructionsDialog
);
