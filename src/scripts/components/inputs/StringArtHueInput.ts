import StringArtRangeInput from './StringArtRangeInput';

const DEFAULT_THUMB_COLOR = 'white';
const FULL_GAMUT_GRADIENT =
  'linear-gradient(to right in hsl longer hue, hsl(1 100 50), hsl(360 100 50))';

export default class StringArtHueInput extends HTMLElement {
  static formAssociated = true;
  internals: ElementInternals;

  start: number = 1; // hue to start with
  colorThumb: boolean = false;
  reverse: boolean = false;
  type: 'hue' | 'range' = 'hue';

  #input: StringArtRangeInput = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });

    this.shadowRoot.innerHTML = `
        <string-art-range-input min="1" max="360" step="1" />
    `;

    this.#input = this.shadowRoot.querySelector('string-art-range-input');
    this.internals = this.attachInternals();
  }

  static get observedAttributes() {
    return ['start', 'colorthumb', 'value', 'reverse', 'type'];
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (name === 'value') {
      this.value = newVal;
    }

    if (name === 'start') {
      this.start = parseInt(newVal, 10);
      this.#setBackground();
    }

    if (name === 'reverse') {
      this.reverse = !!newVal;
      this.#setBackground();
    }

    if (name === 'colorthumb') {
      this.colorThumb = !!newVal;
      this.#setThumbColor();
      // Update color thumb
    }

    if (name === 'type') {
      this.type = newVal === 'range' ? 'range' : 'hue';
      this.#setBackground();
    }
  }

  get value(): number {
    return this.#input.value;
  }

  set value(v: number | string) {
    this.#input.value = v;
    this.#setBackground();

    if (this.colorThumb) {
      this.#setThumbColor();
    }
  }

  connectedCallback() {
    if (this.hasAttribute('value')) {
      this.value = parseInt(this.getAttribute('value'));
    }

    if (this.hasAttribute('colorthumb')) {
      this.colorThumb = true;
    }
    this.#setThumbColor();

    this.#input.addEventListener('input', e => this.#handleInput(e));
  }

  #handleInput(e: Event) {
    const value = this.value;

    this.internals.setFormValue(String(value));

    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value },
      })
    );

    this.#setBackground();
    this.#setThumbColor();
  }
  disconnectedCallback() {
    // Destroy EditorControls here
  }

  focus() {}

  blur() {}

  #setBackground(): void {
    const background =
      this.type === 'range'
        ? `linear-gradient(to ${this.reverse ? 'left' : 'right'} in hsl ${
            this.value >= 180 ? 'longer' : 'shorter'
          } hue, hsl(${this.start} 100 50), hsl(${
            // Fixes a bug in Chrome, that for a 180 deg hue gradient, it always goes in reverse
            this.start + (this.value === 180 ? 181 : this.value)
          } 100 50))`
        : FULL_GAMUT_GRADIENT;

    this.#input.setAttribute('background', background);
  }

  #setThumbColor(): void {
    const thumbColor = this.colorThumb
      ? `hsl(${this.value}deg 100 50)`
      : DEFAULT_THUMB_COLOR;

    this.#input.setAttribute('thumbcolor', thumbColor);
  }
}

customElements.define('string-art-hue-input', StringArtHueInput);
