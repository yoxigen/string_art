import { Dimensions } from '../../types/general.types';
import * as styles from 'bundle-text:./DimensionsInput.css';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

export default class DimensionsInput extends HTMLElement {
  static formAssociated = true;
  internals: ElementInternals;

  defaultWidth = 0;
  defaultHeight = 0;
  #width: number;
  #height: number;
  aspectRatio: number | null;
  maxWidth: number;
  maxHeight: number;
  isReadonly = false;

  #widthElement: HTMLInputElement;
  #heightElement: HTMLInputElement;
  #connectorElement: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.adoptedStyleSheets = [sheet];

    this.shadowRoot.innerHTML = `
      <span id="wrapper">
        <input
          type="number"
          id="width"
          style="width: 80px"
          maxlength="3"
          min="1"
          class="dialog-input size-input"
          name="width"
        />
        <span id="connector">&times;</span>
        <input
          type="number"
          id="height"
          style="width: 80px"
          maxlength="3"
          min="1"
          class="dialog-input size-input"
          name="height"
        />
      </span>
    `;

    this.#widthElement = shadow.querySelector('#width');
    this.#heightElement = shadow.querySelector('#height');
    this.#connectorElement = shadow.querySelector('#connector');

    this.internals = this.attachInternals();
  }

  static get observedAttributes() {
    return [
      'width',
      'height',
      'aspect-ratio',
      'max-width',
      'max-height',
      'readonly',
      'default-width',
      'default-height',
    ];
  }

  get width(): number {
    return this.#width;
  }

  set width(value: number) {
    if (value === this.#width) {
      return;
    }
    if (isNaN(value)) {
      console.warn('Attempting to set a NaN value to DimensionsInput width.');
    } else {
      if (this.maxWidth) {
        value = Math.min(value, this.maxWidth);
      }
      this.#width = value;
      if (this.aspectRatio) {
        this.height = value / this.aspectRatio;
      }

      this.#widthElement.value = String(value);
    }
  }

  get height(): number {
    return this.#height;
  }

  set height(value: number) {
    if (value === this.#height) {
      return;
    }
    if (isNaN(value)) {
      console.warn('Attempting to set a NaN value to DimensionsInput height.');
    } else {
      if (this.maxHeight) {
        value = Math.min(value, this.maxHeight);
      }

      this.#height = value;
      if (this.aspectRatio) {
        this.width = value * this.aspectRatio;
      }

      this.#heightElement.value = String(value);
    }
  }

  get value(): Dimensions {
    return [this.width, this.height];
  }

  set value([width, height]: [number, number]) {
    this.width = width;
    this.height = height;
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (name === 'aspect-ratio') {
      const value = Number(newVal);
      this.aspectRatio = isNaN(value) ? null : value;
    } else if (name === 'max-width') {
    }
  }

  connectedCallback() {
    this.shadowRoot.addEventListener('input', e =>
      this.#handleInput(e as InputEvent)
    );
    this.#syncAttributes();
  }

  #handleInput(e: InputEvent) {
    if (e.target instanceof HTMLInputElement) {
      const value = Number(e.target.value);

      if (e.target === this.#widthElement) {
        this.width = value;
      } else if (e.target === this.#heightElement) {
        this.height = value;
      }

      this.internals.setFormValue(String(this.value.join(',')));

      this.dispatchEvent(
        new CustomEvent('input', {
          detail: { value: this.value },
        })
      );
    }
  }

  #syncAttributes() {
    if (this.hasAttribute('default-width')) {
      this.defaultWidth = Number(this.getAttribute('default-width'));
      if (isNaN(this.defaultWidth)) {
        this.defaultWidth = 0;
      }
      this.#widthElement.placeholder = String(this.defaultWidth);
    }

    if (this.hasAttribute('default-height')) {
      this.defaultHeight = Number(this.getAttribute('default-height'));
      if (isNaN(this.defaultHeight)) {
        this.defaultHeight = 0;
      }
      this.#heightElement.placeholder = String(this.defaultHeight);
    }

    if (this.hasAttribute('max-width')) {
      this.maxWidth = Number(this.getAttribute('max-width'));
      if (isNaN(this.maxWidth)) {
        this.maxWidth = null;
      }
      this.#widthElement.setAttribute('max', String(this.maxWidth));
    }

    if (this.hasAttribute('max-height')) {
      this.maxHeight = Number(this.getAttribute('max-height'));
      if (isNaN(this.maxHeight)) {
        this.maxHeight = null;
      }
      this.#heightElement.setAttribute('max', String(this.maxHeight));
    }

    if (this.hasAttribute('width')) {
      this.width = Number(this.getAttribute('width'));
      if (isNaN(this.width)) {
        this.width = this.defaultWidth;
      }

      if (this.maxWidth) {
        this.width = Math.min(this.width, this.maxWidth);
      }

      this.#widthElement.value = String(this.width);
    }

    if (this.hasAttribute('height')) {
      this.height = Number(this.getAttribute('height'));
      if (isNaN(this.height)) {
        this.height = this.defaultHeight;
      }

      if (this.maxHeight) {
        this.height = Math.min(this.height, this.maxHeight);
      }

      this.#heightElement.value = String(this.height);
    }

    if (this.hasAttribute('aspect-ratio')) {
      this.aspectRatio = Number(this.getAttribute('aspect-ratio'));
      if (isNaN(this.aspectRatio)) {
        this.aspectRatio = null;
      }
      this.#connectorElement.textContent = '🔗';
    } else {
      this.#connectorElement.textContent = '×';
    }
  }
}

customElements.define('dimensions-input', DimensionsInput);
