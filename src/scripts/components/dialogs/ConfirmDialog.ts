import * as styles from 'bundle-text:./dialog.css';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

export type ConfirmDialogType = 'default' | 'error';

export default class ConfirmDialog extends HTMLElement {
  private dialog: HTMLDialogElement;
  private cancelBtn: HTMLButtonElement;
  private submitBtn: HTMLButtonElement;
  private titleEl: HTMLElement;
  private descEl: HTMLElement;

  static get observedAttributes() {
    return ['title', 'description', 'submit', 'cance', 'type'];
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
          <div id="dialog_contents">
            <slot></slot>
          </div>
          <menu class="dialog-menu">
            <button type="button" class="btn-cancel">Cancel</button>
            <button type="submit" value="confirm" class="btn-submit"></button>
          </menu>
        </form>
      </dialog>
    `;

    this.dialog = shadow.querySelector('dialog')!;
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
    this.submitBtn.textContent = this.getAttribute('submit') || 'Submit';
    this.cancelBtn.textContent = this.getAttribute('cancel') || 'Cancel';

    if (this.hasAttribute('type') && this.getAttribute('type') === 'error') {
      this.dialog.classList.add('error');
    } else {
      this.dialog.classList.remove('error');
    }
  }

  /**
   * Opens the dialog, optionally with an initial value.
   */
  show(): Promise<void> {
    this.dialog.showModal();
    return new Promise((resolve, reject) => {
      const handleClose = () => {
        this.dialog.removeEventListener('close', handleClose);
        if (this.dialog.returnValue === 'confirm') {
          resolve();
        } else {
          reject();
        }
      };
      this.dialog.addEventListener('close', handleClose);
    });
  }

  submit() {
    this.submitBtn.click();
  }
}

customElements.define('confirm-dialog', ConfirmDialog);
