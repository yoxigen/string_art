import { ColorConfig } from '../helpers/color/color.types';

export default class StringArtColorInput extends HTMLElement {
  static formAssociated = true;
  internals: ElementInternals;

  colorCount: number;
  config: ColorConfig;

  #rootElement: HTMLDivElement = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });

    this.shadowRoot.innerHTML = `
        <div id="root"></div>
    `;

    this.#rootElement = this.shadowRoot.querySelector('#root');
    this.internals = this.attachInternals();
  }

  static get observedAttributes() {
    return ['colorcount'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    // Update EditorControls
  }

  get value(): ColorConfig {
    return {};
  }

  set value(v: ColorConfig) {
    // Update EditorControls, attributes
  }

  connectedCallback() {
    // Create EditorControls here
  }

  disconnectedCallback() {
    // Destroy EditorControls here
  }

  focus() {}

  blur() {}
}

customElements.define('string-art-color-input', StringArtColorInput);
