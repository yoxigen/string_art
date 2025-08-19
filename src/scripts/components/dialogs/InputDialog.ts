import * as styles from 'bundle-text:./dialog.css';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

export default class InputDialog extends HTMLElement {
  private dialog: HTMLDialogElement;
  private input: HTMLInputElement;
  private cancelBtn: HTMLButtonElement;
  private submitBtn: HTMLButtonElement;
  private titleEl: HTMLElement;
  private descEl: HTMLElement;

  static get observedAttributes() {
    return ['title', 'description', 'value', 'submit'];
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [sheet];
    this.shadowRoot!.innerHTML = `
      <dialog>
        <form method="dialog">
          <h2 class="dialog-title"></h2>
          <p class="dialog-desc"></p>
          <input
            type="text"
            class="dialog-input"
            name="patternName"
            required
          />
          <menu class="dialog-menu">
            <button type="button" class="btn-cancel">Cancel</button>
            <button type="submit" value="confirm" class="btn-submit"></button>
          </menu>
        </form>
      </dialog>
    `;

    this.dialog = shadow.querySelector('dialog')!;
    this.input = shadow.querySelector('input')!;
    this.cancelBtn = shadow.querySelector('.btn-cancel')!;
    this.submitBtn = shadow.querySelector('.btn-submit')!;
    this.titleEl = shadow.querySelector('.dialog-title')!;
    this.descEl = shadow.querySelector('.dialog-desc')!;
  }

  connectedCallback() {
    this.cancelBtn.addEventListener('click', () => {
      this.dialog.returnValue = '';
      this.dialog.close();
    });

    // Initialize attributes on first connect
    this.syncAttributes();
  }

  attributeChangedCallback() {
    this.syncAttributes();
  }

  private syncAttributes() {
    if (this.hasAttribute('title')) {
      this.titleEl.textContent = this.getAttribute('title');
    }
    if (this.hasAttribute('description')) {
      this.descEl.textContent = this.getAttribute('description');
    }
    if (this.hasAttribute('value')) {
      this.input.value = this.getAttribute('value') || '';
    }
    this.submitBtn.textContent = this.getAttribute('submit') || 'Submit';
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
    this.dialog.showModal();
    this.input.select();
    return new Promise((resolve, reject) => {
      const handleClose = () => {
        this.dialog.removeEventListener('close', handleClose);
        if (this.dialog.returnValue) {
          resolve(this.input.value);
        } else {
          reject();
        }
      };
      this.dialog.addEventListener('close', handleClose);
    });
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
