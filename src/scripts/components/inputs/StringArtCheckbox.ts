import * as styles from 'bundle-text:./StringArtCheckbox.css';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

export default class StringArtCheckbox extends HTMLElement {
  static formAssociated = true;
  internals: ElementInternals;
  #checked: boolean;
  disabled = false;

  #label: HTMLLabelElement;
  #input: HTMLInputElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });

    shadow.adoptedStyleSheets = [sheet];
    this.shadowRoot.innerHTML = `
          <span>
            <input id="checkbox" type="checkbox">
            <label for="checkbox"></label>
          </span>
        `;

    this.#input = shadow.querySelector('input');
    this.#label = shadow.querySelector('label');
    this.internals = this.attachInternals();
  }

  static get observedAttributes() {
    return ['checked', 'label', 'disabled', 'name'];
  }

  attributeChangedCallback() {
    this.syncAttributes();
  }

  get checked(): boolean {
    return this.#checked;
  }

  set checked(v: boolean) {
    if ((this.#checked = v)) {
      this.#input.setAttribute('checked', 'checked');
    } else {
      this.#input.removeAttribute('checked');
    }
  }

  get value(): boolean {
    return this.checked;
  }

  set value(v: boolean) {
    this.checked = v;
  }

  connectedCallback() {
    this.syncAttributes();

    this.#input.addEventListener('input', () => {
      this.#checked = this.#input.checked;

      this.internals.setFormValue(this.#checked ? 'on' : null);

      this.dispatchEvent(
        new CustomEvent('input', {
          detail: { checked: this.#checked },
        })
      );

      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { checked: this.#checked },
          bubbles: true,
        })
      );
    });

    this.internals.setFormValue(this.#checked ? 'on' : null);
    this.tabIndex = 0;
  }

  private syncAttributes() {
    if (this.hasAttribute('label')) {
      this.#label.textContent = this.hasAttribute('label')
        ? this.getAttribute('label')
        : '';
    }

    if (this.hasAttribute('checked')) {
      this.checked = true;
    }

    if (this.hasAttribute('disabled')) {
      this.disabled = true;
    }

    if (this.hasAttribute('name')) {
      this.internals.setFormValue(this.#checked ? 'on' : null);
    }
  }

  focus() {
    this.#input.focus();
  }

  blur() {
    this.#input.blur();
  }
}

customElements.define('string-art-checkbox', StringArtCheckbox);
