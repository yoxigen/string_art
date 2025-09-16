import * as styles from 'bundle-text:./dialog.css';
import * as html from 'bundle-text:./ConfirmDialog.html';
import { hide, unHide } from '../../helpers/dom_utils';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

export type ConfirmDialogType = 'default' | 'error';

export default class ConfirmDialog extends HTMLElement {
  private dialog: HTMLDialogElement;
  private cancelBtn: HTMLButtonElement;
  private submitBtn: HTMLButtonElement;
  private titleEl: HTMLElement;
  private descEl: HTMLElement;
  private submitText: HTMLSpanElement;
  private submitIcon: HTMLElement;

  static get observedAttributes() {
    return [
      'dialog-title',
      'description',
      'submit',
      'cancel',
      'type',
      'centered',
      'submit-icon',
      'width',
    ];
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [sheet];
    this.shadowRoot!.innerHTML = String(html);

    this.dialog = shadow.querySelector('dialog')!;
    this.cancelBtn = shadow.querySelector('.btn-cancel')!;
    this.submitBtn = shadow.querySelector('.btn-submit')!;
    this.titleEl = shadow.querySelector('.dialog-title')!;
    this.descEl = shadow.querySelector('.dialog-desc')!;
    this.submitText = shadow.querySelector('#submit_text')!;
    this.submitIcon = shadow.querySelector('#submit_icon')!;
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
    if (this.hasAttribute('dialog-title')) {
      this.titleEl.textContent = this.getAttribute('dialog-title');
    }
    if (this.hasAttribute('description')) {
      this.descEl.textContent = this.getAttribute('description');
    }
    this.submitText.textContent = this.getAttribute('submit') || 'Submit';
    this.cancelBtn.textContent = this.getAttribute('cancel') || 'Cancel';

    if (this.hasAttribute('type') && this.getAttribute('type') === 'error') {
      this.dialog.classList.add('error');
    } else {
      this.dialog.classList.remove('error');
    }

    if (
      this.hasAttribute('centered') &&
      this.getAttribute('centered') !== 'false'
    ) {
      this.dialog.classList.add('centered');
    } else {
      this.dialog.classList.remove('centered');
    }

    if (this.hasAttribute('submit-icon')) {
      this.submitIcon.className = 'icon-' + this.getAttribute('submit-icon');
      unHide(this.submitIcon);
    } else {
      hide(this.submitIcon);
    }

    if (this.hasAttribute('width')) {
      const value = this.getAttribute('width');
      const isPx = /^\d+$/.test(value);
      this.dialog.style.setProperty('width', isPx ? `${value}px` : value);
    } else {
      this.dialog.style.removeProperty('width');
    }
  }

  /**
   * Opens the dialog, optionally with an initial value.
   */
  show(onShow?: () => void): Promise<void> {
    this.dialog.showModal();
    onShow?.();
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
