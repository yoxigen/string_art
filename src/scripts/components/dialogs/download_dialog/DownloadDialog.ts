import * as styles from 'bundle-text:./DownloadDialog.css';
import * as html from 'bundle-text:./DownloadDialog.html';
import type ConfirmDialog from '../ConfirmDialog';
import type StringArt from '../../../StringArt';
import { STANDARD_SIZES_CM } from '../../../helpers/size_utils';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

export default class DownloadDialog extends HTMLElement {
  private dialog: ConfirmDialog;
  private elements: {
    size: HTMLSelectElement;
  };

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [sheet];
    this.shadowRoot!.innerHTML = String(html);

    this.dialog = shadow.querySelector('confirm-dialog')!;
    this.elements = {
      size: shadow.querySelector('#size'),
    };

    this.#setSizes();
  }

  #setSizes() {
    const dpr = window.devicePixelRatio ?? 1;
    const sizes = [
      ...STANDARD_SIZES_CM,
      {
        id: 'Screen size',
        dimensions: [window.screen.width, window.screen.height].map(v =>
          Math.floor(v * dpr)
        ),
      },
      { id: 'Custom size...', dimensions: null },
    ];
    this.elements.size.innerHTML = sizes
      .map(
        ({ id, dimensions }) =>
          `<option value="${dimensions?.join(',') ?? 'custom'}">${id}</option>`
      )
      .join('\n');
  }

  /**
   * Opens the dialog, optionally with an initial value.
   */
  async show(pattern: StringArt): Promise<void> {
    return this.dialog.show();
  }
}

customElements.define('download-dialog', DownloadDialog);
