import * as styles from 'bundle-text:./DownloadDialog.css';
import * as html from 'bundle-text:./DownloadDialog.html';
import type ConfirmDialog from '../ConfirmDialog';
import type StringArt from '../../../StringArt';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

export default class DownloadDialog extends HTMLElement {
  private dialog: ConfirmDialog;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [sheet];
    this.shadowRoot!.innerHTML = String(html);

    this.dialog = shadow.querySelector('confirm-dialog')!;
  }

  /**
   * Opens the dialog, optionally with an initial value.
   */
  async show(pattern: StringArt): Promise<void> {
    return this.dialog.show();
  }
}

customElements.define('download-dialog', DownloadDialog);
