import * as styles from 'bundle-text:./ExpandablePanel.css';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

export class ExpandablePanel extends HTMLElement {
  #legend: HTMLLegendElement;
  #fieldset: HTMLFieldSetElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.adoptedStyleSheets = [sheet];

    this.shadowRoot!.innerHTML = `
      <fieldset>
        <legend></legend>
        <div>
            <slot></slot>
        </div>
      </fieldset>
      `;
    this.#legend = shadow.querySelector('legend');
    this.#fieldset = shadow.querySelector('fieldset');

    this.#legend.addEventListener('click', () => this.toggle());
  }

  static get observedAttributes() {
    return ['legend', 'minimized'];
  }

  connectedCallback() {
    this.syncAttributes();
  }

  attributeChangedCallback() {
    this.syncAttributes();
  }

  syncAttributes() {
    if (this.hasAttribute('legend')) {
      this.#legend.textContent = this.getAttribute('legend');
    } else {
      this.#fieldset.classList.remove('minimized');
      this.#legend.textContent = '';
    }

    if (this.hasAttribute('minimized')) {
      this.#fieldset.classList.add('minimized');
    } else {
      this.#fieldset.classList.remove('minimized');
    }
  }

  private toggle(): void {
    this.#fieldset.classList.toggle('minimized');
  }

  private open(): void {
    this.#fieldset.classList.remove('minimized');
  }

  private close(): void {
    this.#fieldset.classList.add('minimized');
  }
}

customElements.define('expandable-panel', ExpandablePanel);
