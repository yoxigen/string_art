import * as styles from 'bundle-text:./dialog.css';
import type ConfirmDialog from './ConfirmDialog';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

export default class InputDialog extends HTMLElement {
  private dialog: ConfirmDialog;
  private input: HTMLInputElement;

  static get observedAttributes() {
    return [
      'dialog-title',
      'description',
      'value',
      'submit',
      'cancel',
      'type',
      'submit-icon',
    ];
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [sheet];
    this.shadowRoot!.innerHTML = `
      <confirm-dialog>
        <input
            type="text"
            class="dialog-input dialog-input-tall"
            name="patternName"
            required
          />
      </confirm-dialog>
    `;

    this.dialog = shadow.querySelector('confirm-dialog')!;
    this.input = shadow.querySelector('input')!;
    this.input.addEventListener('keypress', e => {
      if (e.code === 'Enter') {
        this.dialog.submit();
      }
    });
  }

  connectedCallback() {
    this.syncAttributes();
  }

  attributeChangedCallback() {
    this.syncAttributes();
  }

  private syncAttributes() {
    InputDialog.observedAttributes
      .filter(attr => attr !== 'value')
      .forEach(attr => {
        if (this.hasAttribute(attr)) {
          this.dialog.setAttribute(attr, this.getAttribute(attr));
        } else {
          this.dialog.removeAttribute(attr);
        }
      });

    if (this.hasAttribute('value')) {
      this.input.value = this.getAttribute('value') || '';
    }
  }

  /**
   * Opens the dialog, optionally with an initial value.
   */
  show(initialValue?: string): Promise<string | null> {
    if (initialValue !== undefined) {
      this.input.value = initialValue;
    } else if (this.hasAttribute('value')) {
      this.input.value = this.getAttribute('value') || '';
    }
    this.input.select();
    return this.dialog.show().then(() => this.input.value);
  }

  /**
   * Gets the value entered by the user if submitted,
   * or null if canceled.
   */
  getValue(): string | null {
    return this.input.value;
  }
}

customElements.define('input-dialog', InputDialog);
